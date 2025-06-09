/**
 * @fileoverview Defines a tool for generating chart images using the image-charts API.
 */

import { tool } from "llamaindex"; // Changed from @llamaindex/workflow
import { z } from "zod";

// This interface can remain for clarity if used internally by the execute function
export interface ChartParams {
  cht: string;
  chd: string;
  chl?: string;
  chs?: string;
  chtt?: string;
  // chdl?: string;
  // chxt?: string;
  // chxl?: string;
  // chco?: string;
}

const IMAGE_CHARTS_BASE_URL = 'https://image-charts.com/chart';

function buildChartUrl(params: ChartParams): string {
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      queryParams.append(key, value as string);
    }
  }
  return `${IMAGE_CHARTS_BASE_URL}?${queryParams.toString()}`;
}

export const generateChartTool = tool({
  name: "generateChart",
  description: "Generates a chart image URL based on provided specifications such as type, data, labels, size, and title. Returns the image URL or an error message.",
  parameters: z.object({
    cht: z.string().describe("Chart type (e.g., 'lc' for line, 'bvg' for vertical bar group, 'p' for pie)"),
    chd: z.string().describe("Chart data (e.g., 't:10,20,30|40,50,60')"),
    chl: z.string().optional().describe("Chart labels (e.g., 'Label1|Label2')"),
    chs: z.string().optional().describe("Chart size (e.g., '700x300')"),
    chtt: z.string().optional().describe("Chart title (e.g., 'My Awesome Chart')"),
  }),
  execute: async (params: ChartParams): Promise<string> => {
    // cht and chd are guaranteed by zod schema if parsing is successful before execute
    // No need for: if (!params.cht || !params.chd) ...
    try {
      const imageUrl = buildChartUrl(params);
      return `Chart URL generated successfully. You can view the chart at: ${imageUrl}`;
    } catch (error: any) {
      console.error('Error generating chart URL:', error);
      return `Error: Failed to generate chart URL. ${error.message || 'Unknown error'}`;
    }
  },
});

// Example Usage (can be removed or moved to a test file later):
/*
const exampleParams: ChartParams = {
  cht: 'p',
  chd: 't:10,20,30',
  chl: 'Red|Green|Blue',
  chs: '300x200',
  chtt: 'My Pie Chart',
};

async function testTool() {
  const result = await generateChartTool.execute(exampleParams);
  console.log(result);
}
testTool();
*/
