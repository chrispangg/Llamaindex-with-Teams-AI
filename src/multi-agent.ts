import { multiAgent } from "@llamaindex/workflow";
import { mathAgent } from "./math/index";
import { stringAgent } from "./string/index";
import { conciergeAgent } from "./concierge/index";
import { chartAgent } from "./chart/index";

// Create the multi-agent workflow
export const agents = multiAgent({
    agents: [conciergeAgent, mathAgent, stringAgent, chartAgent],
    rootAgent: conciergeAgent,
    verbose: true,
});