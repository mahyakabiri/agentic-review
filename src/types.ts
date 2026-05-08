import type { RestEndpointMethodTypes } from "@octokit/rest";

export type PRFile = RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"][number]
export type PR = RestEndpointMethodTypes["pulls"]["get"]["response"]["data"]
export type Pass = "full" | "structure";
export type Mode = "BUGS" | "SECURITY" | "PERFORMANCE" | "GENERAL";