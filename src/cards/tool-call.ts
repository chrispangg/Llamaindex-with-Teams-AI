import {
    AdaptiveCard,
    TextBlock,
    Container,
    FactSet,
    Fact,
    ActionSet,
    ShowCardAction,
} from "@microsoft/teams.cards";

export interface ToolCallData {
    toolName: string;
    parameters: Record<string, any>;
    result: string;
    timestamp?: string;
}

export function createToolCallCard(toolCallData: ToolCallData): AdaptiveCard {
    const resultText = toolCallData.result;
    const isLongResult = resultText.length > 200; // Threshold for expandable results

    const card = new AdaptiveCard(
        // Header section
        new TextBlock("🔧 Tool Call Executed", {
            size: "Medium",
            weight: "Bolder",
            color: "Accent"
        }),

        // Timestamp if provided
        ...(toolCallData.timestamp ? [
            new TextBlock(toolCallData.timestamp, {
                size: "Small",
                color: "Default",
                isSubtle: true
            })
        ] : []),

        // Tool Information section
        new TextBlock("Tool Information", {
            size: "Medium",
            weight: "Bolder"
        }),

        // Tool details as facts
        new FactSet(
            new Fact("Tool Name", toolCallData.toolName),
            ...Object.entries(toolCallData.parameters).map(([key, value]) =>
                new Fact(key, String(value))
            )
        ),

        // Result section
        new TextBlock("Result", {
            size: "Medium",
            weight: "Bolder"
        }),

        // Show truncated result with expand option if too long
        ...(isLongResult ? [
            new TextBlock(resultText.substring(0, 200) + "...", {
                wrap: true,
                color: "Good"
            }),
            new ActionSet(
                new ShowCardAction({
                    title: "Show Full Result",
                    card: new AdaptiveCard(
                        new TextBlock("Full Result", {
                            size: "Medium",
                            weight: "Bolder"
                        }),
                        new TextBlock(resultText, {
                            wrap: true,
                            color: "Good"
                        })
                    )
                })
            )
        ] : [
            new TextBlock(resultText, {
                wrap: true,
                color: "Good"
            })
        ]),
    );

    return card;
}