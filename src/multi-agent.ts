import { multiAgent } from "@llamaindex/workflow";
import { mathAgent } from "./agents/math/index";
import { stringAgent } from "./agents/string/index";
import { conciergeAgent } from "./agents/concierge/index";
import { chartAgent } from "./agents/chart/index";

// Create the multi-agent workflow
export const agents = multiAgent({
    agents: [conciergeAgent, mathAgent, stringAgent, chartAgent],
    rootAgent: conciergeAgent,
    verbose: true,
});