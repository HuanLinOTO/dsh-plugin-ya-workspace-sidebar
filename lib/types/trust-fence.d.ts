/**
 * Browser-trust fence for this plugin's host routes: Host-header loopback
 * (or a caller-supplied trusted authority) plus same-origin browser markers.
 * Behaviorally the DNS-rebinding / cross-site defense of the /api gateway
 * (mirrored in condensed form from DSH-better-sidebar's trust-fence); this
 * is not authentication.
 */
import type { IncomingHttpHeaders } from 'node:http';
/** The request facts the fence reads (structural subset of IncomingMessage). */
interface RouteTrustRequest {
    headers: IncomingHttpHeaders;
}
/**
 * Decide whether one plugin route request may proceed.
 * @param request - node HTTP request facts (headers).
 * @param trustedHosts - non-loopback authorities this deployment serves.
 * @returns true when the Host is ours (loopback or trusted) and browser
 *   markers are same-origin; absent Origin passes on the bound Host alone,
 *   the opaque "null" origin is refused.
 */
export declare function isTrustedRouteRequest(request: RouteTrustRequest, trustedHosts?: readonly string[]): boolean;
export {};
