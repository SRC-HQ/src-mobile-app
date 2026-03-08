/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sperm_race.json`.
 */
export type SpermRace = {
  address: '2y2AdrVLKqwcA5GQEC1ULEHac3hH9ck565UBqzPaReJZ'
  metadata: {
    name: 'spermRace'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'Sperm Race betting game on Solana'
  }
  instructions: [
    {
      name: 'claimWinnings'
      discriminator: [161, 215, 24, 59, 14, 236, 242, 221]
      accounts: [
        {
          name: 'roundAccount'
          writable: true
        },
        {
          name: 'globalState'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]
              },
            ]
          }
        },
        {
          name: 'babyKingVault'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [98, 97, 98, 121, 95, 107, 105, 110, 103, 95, 118, 97, 117, 108, 116]
              },
            ]
          }
        },
        {
          name: 'betRecord'
          writable: true
        },
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'treasury'
          writable: true
        },
      ]
      args: [
        {
          name: 'spermId'
          type: 'u8'
        },
      ]
    },
    {
      name: 'placeBet'
      docs: ['Place a bet on a sperm (user action)']
      discriminator: [222, 62, 67, 220, 63, 166, 126, 33]
      accounts: [
        {
          name: 'roundAccount'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [114, 111, 117, 110, 100]
              },
              {
                kind: 'arg'
                path: 'roundId'
              },
            ]
          }
        },
        {
          name: 'betRecord'
          writable: true
        },
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'roundId'
          type: 'u64'
        },
        {
          name: 'spermId'
          type: 'u8'
        },
        {
          name: 'amount'
          type: 'u64'
        },
      ]
    },
  ]
  accounts: [
    {
      name: 'babyKingVault'
      discriminator: [16, 115, 28, 91, 209, 216, 248, 224]
    },
    {
      name: 'betRecord'
      discriminator: [144, 217, 102, 109, 200, 164, 66, 178]
    },
    {
      name: 'globalState'
      discriminator: [163, 46, 74, 168, 216, 123, 133, 98]
    },
    {
      name: 'roundAccount'
      discriminator: [130, 93, 63, 79, 92, 58, 4, 134]
    },
  ]
  types: [
    {
      name: 'babyKingVault'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'totalAccumulated'
            type: 'u64'
          },
          {
            name: 'bump'
            type: 'u8'
          },
        ]
      }
    },
    {
      name: 'betRecord'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'user'
            type: 'pubkey'
          },
          {
            name: 'roundId'
            type: 'u64'
          },
          {
            name: 'spermId'
            type: 'u8'
          },
          {
            name: 'amount'
            type: 'u64'
          },
        ]
      }
    },
    {
      name: 'globalState'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'pubkey'
          },
          {
            name: 'treasury'
            type: 'pubkey'
          },
          {
            name: 'currentRound'
            type: 'u64'
          },
        ]
      }
    },
    {
      name: 'roundAccount'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'roundId'
            type: 'u64'
          },
          {
            name: 'hashedSeed'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'endSlot'
            type: 'u64'
          },
          {
            name: 'winnerId'
            type: 'u8'
          },
          {
            name: 'isLocked'
            type: 'bool'
          },
          {
            name: 'totalPot'
            type: 'u64'
          },
          {
            name: 'isResolved'
            type: 'bool'
          },
          {
            name: 'betsPerSperm'
            type: {
              array: ['u64', 10]
            }
          },
          {
            name: 'babyKingHit'
            type: 'bool'
          },
          {
            name: 'babyKingJackpotSnapshot'
            type: 'u64'
          },
        ]
      }
    },
  ]
}
