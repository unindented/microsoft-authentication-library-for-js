/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CacheAccountType, Separators } from "../utils/Constants";
import { IdToken } from "../account/IdToken";
import { buildClientInfo } from "../account/ClientInfo";
import { ICrypto } from "../crypto/ICrypto";
import { Authority } from "../authority/Authority";
import { StringUtils } from "../utils/StringUtils";

/**
 * Type that defines required and optional parameters for an Account field (based on universal cache schema implemented by all MSALs)
 */
export type AccountCacheEntity = {
    homeAccountId: string;
    environment: string;
    realm: string;
    localAccountId: string;
    username: string;
    authorityType: string;
    alternativeAccountId?: string;
    givenName?: string;
    familyName?: string;
    middleName?: string;
    name?: string;
    avatarUrl?: string;
    clientInfo?: string;
    lastModificationTime?: string;
    lastModificationApp?: string;
};

export class AccountCache {

    private account: AccountCacheEntity;
    private accountCacheKey: string;

    constructor(clientInfo: string, authority: Authority, idToken: IdToken, crypto: ICrypto, policy?: string) {
        this.account = this.createAccount(clientInfo, authority, idToken, policy, crypto);
        this.accountCacheKey = this.generateAccountCacheKey();
    }

    /**
     * Generate Account Cache Key as per the schema: <home_account_id>-<environment>-<realm*>
     */
    generateAccountCacheKey(): string {
        const accountCacheKeyArray: Array<string> = [
            this.account.homeAccountId,
            this.account.environment,
            this.account.realm
        ];

        return accountCacheKeyArray.join(Separators.CACHE_KEY_SEPARATOR).toLowerCase();

    }

    /**
     * Build Account cache from IdToken, clientInfo and authority/policy
     * @param clientInfo
     * @param authority
     * @param idToken
     * @param policy
     */
    createAccount(clientInfo: string, authority: Authority, idToken: IdToken, policy: string, crypto: ICrypto): AccountCacheEntity {

        let account: AccountCacheEntity;

        account.authorityType = CacheAccountType.MSSTS_ACCOUNT_TYPE;
        account.clientInfo = clientInfo;
        // TBD: Clarify "policy" addition
        account.homeAccountId = (policy != null) ?
            this.createHomeAccountId(clientInfo, crypto) + Separators.CACHE_KEY_SEPARATOR + policy :
            this.createHomeAccountId(clientInfo, crypto);
        account.environment = authority.canonicalAuthorityUrlComponents.HostNameAndPort;
        account.realm = authority.tenant;

        if (idToken) {
            // How do you account for MSA CID here?
            const localAccountId = !StringUtils.isEmpty(idToken.claims.oid) ? idToken.claims.oid : idToken.claims.sid;
            account.localAccountId = localAccountId;
            account.username = idToken.claims.preferred_username;
            account.name = idToken.claims.name;
        }

        return account;
    }

    /**
     * Build ADFS account type
     * @param authority
     * @param idToken
     */
    createADFSAccount(authority: Authority, idToken: IdToken): AccountCacheEntity {

        let account: AccountCacheEntity;

        account.authorityType = CacheAccountType.ADFS_ACCOUNT_TYPE;
        account.homeAccountId = idToken.claims.sub;
        account.environment = authority.canonicalAuthorityUrlComponents.HostNameAndPort;
        account.username = idToken.claims.upn;
        // add uniqueName to claims
        // account.name = idToken.claims.uniqueName;

        return account;
    }

    /**
     * Helper function to build homeAccountId
     * @param clientInfo
     */
    createHomeAccountId(clientInfo: string, crypto: ICrypto): string {
        const clientInfoObj = buildClientInfo(clientInfo, crypto);
        return `${clientInfoObj.uid}${Separators.CLIENT_INFO_SEPARATOR}${clientInfoObj.utid}`;
    }
}

