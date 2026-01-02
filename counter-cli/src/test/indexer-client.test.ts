import { gql } from 'graphql-tag';
import { ApolloClient } from '@apollo/client/core/ApolloClient';
import type { NormalizedCacheObject } from '@apollo/client';
import { InMemoryCache } from '@apollo/client/cache/inmemory/inMemoryCache';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { PreviewConfig } from '../config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

//docs can be found here: https://github.com/midnightntwrk/midnight-indexer/blob/main/docs/api/v3/api-documentation.md

export const TXS_FROM_BLOCK_SUB = gql`
  subscription TXS_FROM_BLOCK_SUB($offset: BlockOffset) {
    blocks(offset: $offset) {
      height
      hash
      transactions {
        hash
        contractActions {
          address
        }
      }
    }
  }
`;

export const TXS_FROM_BLOCK_QUERY = gql`
  query TXS_FROM_BLOCK_QUERY($offset: BlockOffset) {
    block(offset: $offset) {
      height
      hash
      transactions {
        hash
        contractActions {
          address
        }
      }
    }
  }
`;

describe('Indexer Client', () => {
  let config: PreviewConfig;
  let client: ApolloClient<NormalizedCacheObject>;

  beforeAll(() => {
    config = new PreviewConfig();

    const wsLink = new GraphQLWsLink(
      createClient({
        url: config.indexerWS,
      }),
    );

    client = new ApolloClient<NormalizedCacheObject>({
      link: wsLink,
      cache: new InMemoryCache(),
    });
  });

  it('should connect to indexer and subscribe to blocks', async () => {
    const height = 0;
    const subscription = client.subscribe({
      query: TXS_FROM_BLOCK_SUB,
      variables: { offset: { height } },
    });
    const subscriptionResult = await new Promise((resolve, reject) => {
      subscription.subscribe({
        next: resolve,
        error: reject,
      });
    });
    console.log({subscriptionResult});
  });

  it('should connect to indexer and query blocks', async () => {
    const height = 0;
    const result = await client.query({
      query: TXS_FROM_BLOCK_QUERY,
      variables: { offset: { height } },
    });    
    console.log({result: result.data.block});
    console.log({transaction: result.data.block.transactions[0]});
  });

  // it('connect', async () => {
  //   const result = await client.mutate({
  //     mutation: gql`
  //       mutation {
  //         connect(viewingKey: "mn_shield-esk1sx6prym3qx4cq9rydga33803pg8v64y7tmnveug6jd69v35ymeesf6ydqc")
  //       }
  //     `
  //   });
  //   console.log({result});
  // });
});
