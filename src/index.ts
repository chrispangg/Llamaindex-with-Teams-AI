import { App } from '@microsoft/teams.apps';
import { DevtoolsPlugin } from '@microsoft/teams.dev';
import { agents } from './multi-agent';
import { agentStreamEvent } from '@llamaindex/workflow';
import {
  createToolCallCard,
  ToolCallData
} from './cards/tool-call';
import { getOrCreateConversationHistory } from './chat-history';
import { ChatMessage } from '@llamaindex/core/llms';
import { Settings } from "llamaindex";
import env from './env.config';
import { OpenAI } from "@llamaindex/openai";

Settings.llm = new OpenAI({ model: "gpt-4.1-mini", temperature: 0, apiKey: env.OPENAI_API_KEY });


const app = new App({
  plugins: [new DevtoolsPlugin()],
});

app.on('message', async ({ stream, send, activity }) => {
  await send({ type: 'typing' });

  try {
    const conversationId = activity.conversation.id;
    const conversationHistory = getOrCreateConversationHistory(conversationId);

    // Use the math agent to process the user's message with streaming
    const events = agents.runStream(activity.text || "Hello!", {
      chatHistory: await conversationHistory.getMessages()
    });
    let currentToolCall: Partial<ToolCallData> = {};
    let fullResponse = '';
    let isToolCalling = false;

    for await (const event of events) {
      // Log all events to see what we're getting
      console.log("\nEvent received:", JSON.stringify(event, null, 2));

      if (agentStreamEvent.include(event)) {
        // If we're not in the middle of tool calling, stream the response if there is a delta
        if (!isToolCalling && event.data.delta) {
          fullResponse += event.data.delta;
          stream.emit(event.data.delta);
        }
      } else {
        // Handle workflow events for tool calls
        const eventData = event.data as any;

        // Tool call started - just capture the data, don't send a card
        if (eventData.toolName && eventData.toolKwargs && !eventData.toolOutput) {
          isToolCalling = true;
          currentToolCall = {
            toolName: eventData.toolName,
            parameters: eventData.toolKwargs,
            timestamp: new Date().toISOString()
          };

          console.log(`Tool started: ${eventData.toolName}`);
        }
        // Tool call completed - send the detailed execution card
        else if (eventData.toolName && eventData.toolOutput) {
          if (currentToolCall.toolName === eventData.toolName) {
            // Complete the tool call data
            const completedToolCall: ToolCallData = {
              toolName: eventData.toolName,
              parameters: currentToolCall.parameters || {},
              result: eventData.toolOutput.result || eventData.toolOutput,
              timestamp: currentToolCall.timestamp || new Date().toISOString()
            };

            // Send detailed tool call card showing execution results
            const toolCallCard = createToolCallCard(completedToolCall);
            await send(toolCallCard);

            console.log(`Tool completed: ${eventData.toolName} = ${completedToolCall.result}`);

            // Reset current tool call
            currentToolCall = {};
            isToolCalling = false;
          }
        }
      }
    }

    // Store the conversation after processing all events
    await conversationHistory.put({
      role: 'user',
      content: fullResponse
    } as ChatMessage);
  } catch (error) {
    console.error('Error running agent:', error);
    await send(`Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

async function runTest() {
  console.log("--- Starting ChartAgent Test ---");
  const testPrompt = "Please generate a pie chart with data 10,20,30 and labels Red,Green,Blue";
  let finalMessage = "";
  let chartUrl = "";

  try {
    const events = agents.runStream(testPrompt, { chatHistory: [] });
    for await (const event of events) {
      console.log("\nEvent received:", JSON.stringify(event, null, 2));

      if (agentStreamEvent.include(event)) {
        if (event.data.delta) {
          finalMessage += event.data.delta;
        }
      } else {
        const eventData = event.data as any;
        if (eventData.toolName === "generateChart" && eventData.toolOutput) {
          // The output from our tool is directly the message string
          chartUrl = eventData.toolOutput.result || eventData.toolOutput;
          console.log(`Chart Generation Tool Output: ${chartUrl}`);
        }
        if (eventData.toolName && eventData.toolOutput && eventData.toolOutput.result) {
          // If result is an object with a message property (older structure)
          if (typeof eventData.toolOutput.result === 'object' && eventData.toolOutput.result.message) {
            chartUrl = eventData.toolOutput.result.message;
          } else if (typeof eventData.toolOutput.result === 'string') {
            // If result is a string (current structure from ChartAgent tool definition)
            chartUrl = eventData.toolOutput.result;
          }
          console.log(`Tool Output for ${eventData.toolName}: ${chartUrl}`);
        }
      }
    }
    console.log("\n--- Test Final Message From Agent ---");
    console.log(finalMessage);

    if (chartUrl.includes("image-charts.com")) {
      console.log("\n--- Test Succeeded ---");
      console.log("ChartAgent was likely invoked and returned a chart URL.");
      console.log("Generated URL (or message containing it):", chartUrl);
    } else if (finalMessage.includes("image-charts.com")) {
      console.log("\n--- Test Succeeded (URL in final message) ---");
      console.log("ChartAgent was likely invoked and returned a chart URL within the final message.");
      console.log("Final Message:", finalMessage);
    }
    else {
      console.log("\n--- Test Potentially Failed ---");
      console.log("ChartAgent may not have been invoked or failed to return a valid chart URL.");
      console.log("Final Message:", finalMessage);
      console.log("Last captured chartURL variable:", chartUrl);
    }

  } catch (error) {
    console.error("Error during test:", error);
    console.log("\n--- Test Failed (Exception) ---");
  }
  console.log("--- ChartAgent Test Finished ---");
}

(async () => {
  if (process.argv.includes('--test-chart-agent')) {
    await runTest();
    process.exit(0); // Exit after test
  } else {
    await app.start(+(process.env.PORT || 3978));
    console.log('Teams app started with agent integration and adaptive cards');
  }
})();
