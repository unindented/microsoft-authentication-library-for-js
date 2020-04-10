/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Constants, SchemaVersion, MserTelemetry } from "../utils/Constants";
import { AuthCache } from "../cache/AuthCache";

export class RequestTelemetry {

    // API to add MSER Telemetry to request
    static currentRequest(apiId: number, forceRefresh: boolean): string {
        return `${SchemaVersion}${Constants.resourceDelimiter}${apiId}${Constants.resourceDelimiter}${forceRefresh}`;
    }

    // API to add MSER Telemetry for the last failed request
    static lastFailedRequest(): string {
        return null;
    }

    // API to cache token failures for MSER data capture
    static cacheRequestErrors() {

    }

    /**
     * resets CacheHits after calling a NW call
     * @param cacheHits
     * @param cacheStorage
     */
    static resetCacheHits(cacheHits: number, cacheStorage: AuthCache): number {
        cacheHits = 0;
        cacheStorage.setItem(MserTelemetry.CACHE_HITS, `${cacheHits}`);
        return cacheHits;
    }
}
