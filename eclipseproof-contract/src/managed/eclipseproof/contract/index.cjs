'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.8.1';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('-')[0].split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('-')[0].split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeBoolean();

const _descriptor_1 = new __compactRuntime.CompactTypeBytes(32);

class _ZswapCoinPublicKey_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_2 = new _ZswapCoinPublicKey_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_3 = new _ContractAddress_0();

class _Either_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_0.fromValue(value_0),
      left: _descriptor_2.fromValue(value_0),
      right: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.is_left).concat(_descriptor_2.toValue(value_0.left).concat(_descriptor_3.toValue(value_0.right)));
  }
}

const _descriptor_4 = new _Either_0();

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(1n, 1);

class _EarningsProof_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_1.alignment().concat(_descriptor_5.alignment().concat(_descriptor_6.alignment().concat(_descriptor_5.alignment()))));
  }
  fromValue(value_0) {
    return {
      epoch: _descriptor_5.fromValue(value_0),
      userHash: _descriptor_1.fromValue(value_0),
      claimedAmount: _descriptor_5.fromValue(value_0),
      verified: _descriptor_6.fromValue(value_0),
      timestamp: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.epoch).concat(_descriptor_1.toValue(value_0.userHash).concat(_descriptor_5.toValue(value_0.claimedAmount).concat(_descriptor_6.toValue(value_0.verified).concat(_descriptor_5.toValue(value_0.timestamp)))));
  }
}

const _descriptor_7 = new _EarningsProof_0();

class _VerificationRequest_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_5.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      userHash: _descriptor_1.fromValue(value_0),
      requiredAmount: _descriptor_5.fromValue(value_0),
      requesterId: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.userHash).concat(_descriptor_5.toValue(value_0.requiredAmount).concat(_descriptor_1.toValue(value_0.requesterId)));
  }
}

const _descriptor_8 = new _VerificationRequest_0();

const _descriptor_9 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_10 = new __compactRuntime.CompactTypeVector(4, _descriptor_1);

const _descriptor_11 = new __compactRuntime.CompactTypeVector(3, _descriptor_1);

const _descriptor_12 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_13 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.userSecretKey) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named userSecretKey');
    }
    if (typeof(witnesses_0.userName) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named userName');
    }
    if (typeof(witnesses_0.userDateOfBirth) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named userDateOfBirth');
    }
    if (typeof(witnesses_0.netPayFromPayslip) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named netPayFromPayslip');
    }
    if (typeof(witnesses_0.claimedEarnings) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named claimedEarnings');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      publicKey(context, ...args_1) {
        return { result: pureCircuits.publicKey(...args_1), context };
      },
      createUserHash(context, ...args_1) {
        return { result: pureCircuits.createUserHash(...args_1), context };
      },
      bumpEpoch: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`bumpEpoch: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('bumpEpoch',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 102 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._bumpEpoch_0(context, partialProofData);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      setMinNetPayThreshold: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`setMinNetPayThreshold: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const threshold_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('setMinNetPayThreshold',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 107 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(threshold_0) === 'bigint' && threshold_0 >= 0n && threshold_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('setMinNetPayThreshold',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'eclipseproof.compact line 107 char 1',
                                      'Uint<0..18446744073709551615>',
                                      threshold_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_5.toValue(threshold_0),
            alignment: _descriptor_5.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._setMinNetPayThreshold_0(context,
                                                       partialProofData,
                                                       threshold_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      revokeEarningsProof: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`revokeEarningsProof: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const userPk_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('revokeEarningsProof',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 113 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(userPk_0.buffer instanceof ArrayBuffer && userPk_0.BYTES_PER_ELEMENT === 1 && userPk_0.length === 32)) {
          __compactRuntime.type_error('revokeEarningsProof',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'eclipseproof.compact line 113 char 1',
                                      'Bytes<32>',
                                      userPk_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(userPk_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._revokeEarningsProof_0(context,
                                                     partialProofData,
                                                     userPk_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      enrollAndProveEarnings: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`enrollAndProveEarnings: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('enrollAndProveEarnings',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 123 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._enrollAndProveEarnings_0(context,
                                                        partialProofData);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      updateEarningsProof: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`updateEarningsProof: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('updateEarningsProof',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 148 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._updateEarningsProof_0(context, partialProofData);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      createVerificationRequest: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`createVerificationRequest: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const targetUserHash_0 = args_1[1];
        const requiredAmount_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('createVerificationRequest',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 176 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(targetUserHash_0.buffer instanceof ArrayBuffer && targetUserHash_0.BYTES_PER_ELEMENT === 1 && targetUserHash_0.length === 32)) {
          __compactRuntime.type_error('createVerificationRequest',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'eclipseproof.compact line 176 char 1',
                                      'Bytes<32>',
                                      targetUserHash_0)
        }
        if (!(typeof(requiredAmount_0) === 'bigint' && requiredAmount_0 >= 0n && requiredAmount_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('createVerificationRequest',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'eclipseproof.compact line 176 char 1',
                                      'Uint<0..18446744073709551615>',
                                      requiredAmount_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(targetUserHash_0).concat(_descriptor_5.toValue(requiredAmount_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_5.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createVerificationRequest_0(context,
                                                           partialProofData,
                                                           targetUserHash_0,
                                                           requiredAmount_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      verifyEarningsByHash(context, ...args_1) {
        return { result: pureCircuits.verifyEarningsByHash(...args_1), context };
      },
      verifyEarningsByUserPk: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`verifyEarningsByUserPk: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const userPk_0 = args_1[1];
        const expectedUserHash_0 = args_1[2];
        const requiredAmount_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('verifyEarningsByUserPk',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 216 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(userPk_0.buffer instanceof ArrayBuffer && userPk_0.BYTES_PER_ELEMENT === 1 && userPk_0.length === 32)) {
          __compactRuntime.type_error('verifyEarningsByUserPk',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'eclipseproof.compact line 216 char 1',
                                      'Bytes<32>',
                                      userPk_0)
        }
        if (!(expectedUserHash_0.buffer instanceof ArrayBuffer && expectedUserHash_0.BYTES_PER_ELEMENT === 1 && expectedUserHash_0.length === 32)) {
          __compactRuntime.type_error('verifyEarningsByUserPk',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'eclipseproof.compact line 216 char 1',
                                      'Bytes<32>',
                                      expectedUserHash_0)
        }
        if (!(typeof(requiredAmount_0) === 'bigint' && requiredAmount_0 >= 0n && requiredAmount_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('verifyEarningsByUserPk',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'eclipseproof.compact line 216 char 1',
                                      'Uint<0..18446744073709551615>',
                                      requiredAmount_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(userPk_0).concat(_descriptor_1.toValue(expectedUserHash_0).concat(_descriptor_5.toValue(requiredAmount_0))),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_5.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._verifyEarningsByUserPk_0(context,
                                                        partialProofData,
                                                        userPk_0,
                                                        expectedUserHash_0,
                                                        requiredAmount_0);
        partialProofData.output = { value: _descriptor_6.toValue(result_0), alignment: _descriptor_6.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getEpoch: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getEpoch: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getEpoch',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 239 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getEpoch_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_5.toValue(result_0), alignment: _descriptor_5.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getInstanceBytes: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getInstanceBytes: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getInstanceBytes',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 243 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getInstanceBytes_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getMinNetPayThreshold: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getMinNetPayThreshold: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getMinNetPayThreshold',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 247 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getMinNetPayThreshold_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_5.toValue(result_0), alignment: _descriptor_5.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getMyEarningsProof: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getMyEarningsProof: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getMyEarningsProof',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 251 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getMyEarningsProof_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_7.toValue(result_0), alignment: _descriptor_7.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getEarningsProofByPk: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`getEarningsProofByPk: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const userPk_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getEarningsProofByPk',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 257 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(userPk_0.buffer instanceof ArrayBuffer && userPk_0.BYTES_PER_ELEMENT === 1 && userPk_0.length === 32)) {
          __compactRuntime.type_error('getEarningsProofByPk',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'eclipseproof.compact line 257 char 1',
                                      'Bytes<32>',
                                      userPk_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(userPk_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getEarningsProofByPk_0(context,
                                                      partialProofData,
                                                      userPk_0);
        partialProofData.output = { value: _descriptor_7.toValue(result_0), alignment: _descriptor_7.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      checkEarningsThreshold: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`checkEarningsThreshold: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const userPk_0 = args_1[1];
        const threshold_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('checkEarningsThreshold',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 262 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(userPk_0.buffer instanceof ArrayBuffer && userPk_0.BYTES_PER_ELEMENT === 1 && userPk_0.length === 32)) {
          __compactRuntime.type_error('checkEarningsThreshold',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'eclipseproof.compact line 262 char 1',
                                      'Bytes<32>',
                                      userPk_0)
        }
        if (!(typeof(threshold_0) === 'bigint' && threshold_0 >= 0n && threshold_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('checkEarningsThreshold',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'eclipseproof.compact line 262 char 1',
                                      'Uint<0..18446744073709551615>',
                                      threshold_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(userPk_0).concat(_descriptor_5.toValue(threshold_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_5.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._checkEarningsThreshold_0(context,
                                                        partialProofData,
                                                        userPk_0,
                                                        threshold_0);
        partialProofData.output = { value: _descriptor_6.toValue(result_0), alignment: _descriptor_6.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      owner: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`owner: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('owner',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 276 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._owner_1(context, partialProofData);
        partialProofData.output = { value: _descriptor_4.toValue(result_0), alignment: _descriptor_4.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      transferOwnership: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`transferOwnership: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const newOwner_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('transferOwnership',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 280 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(newOwner_0) === 'object' && typeof(newOwner_0.is_left) === 'boolean' && typeof(newOwner_0.left) === 'object' && newOwner_0.left.bytes.buffer instanceof ArrayBuffer && newOwner_0.left.bytes.BYTES_PER_ELEMENT === 1 && newOwner_0.left.bytes.length === 32 && typeof(newOwner_0.right) === 'object' && newOwner_0.right.bytes.buffer instanceof ArrayBuffer && newOwner_0.right.bytes.BYTES_PER_ELEMENT === 1 && newOwner_0.right.bytes.length === 32)) {
          __compactRuntime.type_error('transferOwnership',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'eclipseproof.compact line 280 char 1',
                                      'struct Either<is_left: Boolean, left: struct ZswapCoinPublicKey<bytes: Bytes<32>>, right: struct ContractAddress<bytes: Bytes<32>>>',
                                      newOwner_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_4.toValue(newOwner_0),
            alignment: _descriptor_4.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._transferOwnership_1(context,
                                                   partialProofData,
                                                   newOwner_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      renounceOwnership: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`renounceOwnership: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('renounceOwnership',
                                      'argument 1 (as invoked from Typescript)',
                                      'eclipseproof.compact line 284 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._renounceOwnership_1(context, partialProofData);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      }
    };
    this.impureCircuits = {
      bumpEpoch: this.circuits.bumpEpoch,
      setMinNetPayThreshold: this.circuits.setMinNetPayThreshold,
      revokeEarningsProof: this.circuits.revokeEarningsProof,
      enrollAndProveEarnings: this.circuits.enrollAndProveEarnings,
      updateEarningsProof: this.circuits.updateEarningsProof,
      createVerificationRequest: this.circuits.createVerificationRequest,
      verifyEarningsByUserPk: this.circuits.verifyEarningsByUserPk,
      getEpoch: this.circuits.getEpoch,
      getInstanceBytes: this.circuits.getInstanceBytes,
      getMinNetPayThreshold: this.circuits.getMinNetPayThreshold,
      getMyEarningsProof: this.circuits.getMyEarningsProof,
      getEarningsProofByPk: this.circuits.getEarningsProofByPk,
      checkEarningsThreshold: this.circuits.checkEarningsThreshold,
      owner: this.circuits.owner,
      transferOwnership: this.circuits.transferOwnership,
      renounceOwnership: this.circuits.renounceOwnership
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const initialOwner_0 = args_0[1];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(typeof(initialOwner_0) === 'object' && typeof(initialOwner_0.is_left) === 'boolean' && typeof(initialOwner_0.left) === 'object' && initialOwner_0.left.bytes.buffer instanceof ArrayBuffer && initialOwner_0.left.bytes.BYTES_PER_ELEMENT === 1 && initialOwner_0.left.bytes.length === 32 && typeof(initialOwner_0.right) === 'object' && initialOwner_0.right.bytes.buffer instanceof ArrayBuffer && initialOwner_0.right.bytes.BYTES_PER_ELEMENT === 1 && initialOwner_0.right.bytes.length === 32)) {
      __compactRuntime.type_error('Contract state constructor',
                                  'argument 1 (argument 2 as invoked from Typescript)',
                                  'eclipseproof.compact line 62 char 1',
                                  'struct Either<is_left: Boolean, left: struct ZswapCoinPublicKey<bytes: Bytes<32>>, right: struct ContractAddress<bytes: Bytes<32>>>',
                                  initialOwner_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = stateValue_0;
    state_0.setOperation('bumpEpoch', new __compactRuntime.ContractOperation());
    state_0.setOperation('setMinNetPayThreshold', new __compactRuntime.ContractOperation());
    state_0.setOperation('revokeEarningsProof', new __compactRuntime.ContractOperation());
    state_0.setOperation('enrollAndProveEarnings', new __compactRuntime.ContractOperation());
    state_0.setOperation('updateEarningsProof', new __compactRuntime.ContractOperation());
    state_0.setOperation('createVerificationRequest', new __compactRuntime.ContractOperation());
    state_0.setOperation('verifyEarningsByUserPk', new __compactRuntime.ContractOperation());
    state_0.setOperation('getEpoch', new __compactRuntime.ContractOperation());
    state_0.setOperation('getInstanceBytes', new __compactRuntime.ContractOperation());
    state_0.setOperation('getMinNetPayThreshold', new __compactRuntime.ContractOperation());
    state_0.setOperation('getMyEarningsProof', new __compactRuntime.ContractOperation());
    state_0.setOperation('getEarningsProofByPk', new __compactRuntime.ContractOperation());
    state_0.setOperation('checkEarningsThreshold', new __compactRuntime.ContractOperation());
    state_0.setOperation('owner', new __compactRuntime.ContractOperation());
    state_0.setOperation('transferOwnership', new __compactRuntime.ContractOperation());
    state_0.setOperation('renounceOwnership', new __compactRuntime.ContractOperation());
    const context = {
      originalState: state_0,
      currentPrivateState: constructorContext_0.initialPrivateState,
      currentZswapLocalState: constructorContext_0.initialZswapLocalState,
      transactionContext: new __compactRuntime.QueryContext(state_0.data, __compactRuntime.dummyContractAddress())
    };
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(0n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue({ is_left: false, left: { bytes: new Uint8Array(32) }, right: { bytes: new Uint8Array(32) } }),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(1n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(false),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(2n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(3n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(4n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(5n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(6n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_12.toValue(3n),
                                                alignment: _descriptor_12.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_9.toValue(tmp_0),
                                              alignment: _descriptor_9.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    const tmp_1 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_12.toValue(2n),
                                                alignment: _descriptor_12.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_9.toValue(tmp_1),
                                              alignment: _descriptor_9.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    this._initialize_0(context, partialProofData, initialOwner_0);
    const tmp_2 = 1000n;
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(6n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(tmp_2),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    state_0.data = context.transactionContext.state;
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _left_0(value_0) {
    return { is_left: true, left: value_0, right: { bytes: new Uint8Array(32) } };
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_11, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_10, value_0);
    return result_0;
  }
  _ownPublicKey_0(context, partialProofData) {
    const result_0 = __compactRuntime.ownPublicKey(context);
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _burnAddress_0() { return this._left_0({ bytes: new Uint8Array(32) }); }
  _initialize_0(context, partialProofData, initialOwner_0) {
    this._initialize_1(context, partialProofData);
    __compactRuntime.assert(!this._isKeyOrAddressZero_0(initialOwner_0),
                            'Ownable: invalid initial owner');
    this.__transferOwnership_0(context, partialProofData, initialOwner_0);
    return [];
  }
  _owner_0(context, partialProofData) {
    this._assertInitialized_0(context, partialProofData);
    return _descriptor_4.fromValue(Contract._query(context,
                                                   partialProofData,
                                                   [
                                                    { dup: { n: 0 } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_12.toValue(0n),
                                                                               alignment: _descriptor_12.alignment() } }] } },
                                                    { popeq: { cached: false,
                                                               result: undefined } }]).value);
  }
  _transferOwnership_0(context, partialProofData, newOwner_0) {
    this._assertInitialized_0(context, partialProofData);
    __compactRuntime.assert(!this._isContractAddress_0(newOwner_0),
                            'Ownable: unsafe ownership transfer');
    this.__unsafeTransferOwnership_0(context, partialProofData, newOwner_0);
    return [];
  }
  __unsafeTransferOwnership_0(context, partialProofData, newOwner_0) {
    this._assertInitialized_0(context, partialProofData);
    this._assertOnlyOwner_0(context, partialProofData);
    __compactRuntime.assert(!this._isKeyOrAddressZero_0(newOwner_0),
                            'Ownable: invalid new owner');
    this.__unsafeUncheckedTransferOwnership_0(context,
                                              partialProofData,
                                              newOwner_0);
    return [];
  }
  _renounceOwnership_0(context, partialProofData) {
    this._assertInitialized_0(context, partialProofData);
    this._assertOnlyOwner_0(context, partialProofData);
    this.__transferOwnership_0(context, partialProofData, this._burnAddress_0());
    return [];
  }
  _assertOnlyOwner_0(context, partialProofData) {
    this._assertInitialized_0(context, partialProofData);
    const caller_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.assert(this._equal_0(caller_0,
                                          _descriptor_4.fromValue(Contract._query(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_12.toValue(0n),
                                                                                                              alignment: _descriptor_12.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value).left),
                            'Ownable: caller is not the owner');
    return [];
  }
  __transferOwnership_0(context, partialProofData, newOwner_0) {
    this._assertInitialized_0(context, partialProofData);
    __compactRuntime.assert(!this._isContractAddress_0(newOwner_0),
                            'Ownable: unsafe ownership transfer');
    this.__unsafeUncheckedTransferOwnership_0(context,
                                              partialProofData,
                                              newOwner_0);
    return [];
  }
  __unsafeUncheckedTransferOwnership_0(context, partialProofData, newOwner_0) {
    this._assertInitialized_0(context, partialProofData);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(0n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(newOwner_0),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _isKeyOrAddressZero_0(keyOrAddress_0) {
    if (this._isContractAddress_0(keyOrAddress_0)) {
      return this._equal_1({ bytes: new Uint8Array(32) }, keyOrAddress_0.right);
    } else {
      return this._equal_2({ bytes: new Uint8Array(32) }, keyOrAddress_0.left);
    }
  }
  _isContractAddress_0(keyOrAddress_0) { return !keyOrAddress_0.is_left; }
  _initialize_1(context, partialProofData) {
    this._assertNotInitialized_0(context, partialProofData);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(1n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(true),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _assertInitialized_0(context, partialProofData) {
    __compactRuntime.assert(_descriptor_0.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_12.toValue(1n),
                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                     { popeq: { cached: false,
                                                                                result: undefined } }]).value),
                            'Initializable: contract not initialized');
    return [];
  }
  _assertNotInitialized_0(context, partialProofData) {
    __compactRuntime.assert(!_descriptor_0.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_12.toValue(1n),
                                                                                                 alignment: _descriptor_12.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value),
                            'Initializable: contract already initialized');
    return [];
  }
  _userSecretKey_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.userSecretKey(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.type_error('userSecretKey',
                                  'return value',
                                  'eclipseproof.compact line 52 char 1',
                                  'Bytes<32>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _userName_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.userName(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.type_error('userName',
                                  'return value',
                                  'eclipseproof.compact line 53 char 1',
                                  'Bytes<32>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _userDateOfBirth_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.userDateOfBirth(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.type_error('userDateOfBirth',
                                  'return value',
                                  'eclipseproof.compact line 54 char 1',
                                  'Bytes<32>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _netPayFromPayslip_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.netPayFromPayslip(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('netPayFromPayslip',
                                  'return value',
                                  'eclipseproof.compact line 55 char 1',
                                  'Uint<0..18446744073709551615>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_5.toValue(result_0),
      alignment: _descriptor_5.alignment()
    });
    return result_0;
  }
  _claimedEarnings_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.claimedEarnings(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('claimedEarnings',
                                  'return value',
                                  'eclipseproof.compact line 56 char 1',
                                  'Uint<0..18446744073709551615>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_5.toValue(result_0),
      alignment: _descriptor_5.alignment()
    });
    return result_0;
  }
  _publicKey_0(inst_0, sk_0) {
    return this._persistentHash_0([new Uint8Array([101, 99, 108, 105, 112, 115, 101, 58, 112, 107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   inst_0,
                                   sk_0]);
  }
  _userPublicKey_0(context, partialProofData) {
    const instB_0 = __compactRuntime.convert_bigint_to_Uint8Array(32,
                                                                  _descriptor_5.fromValue(Contract._query(context,
                                                                                                          partialProofData,
                                                                                                          [
                                                                                                           { dup: { n: 0 } },
                                                                                                           { idx: { cached: false,
                                                                                                                    pushPath: false,
                                                                                                                    path: [
                                                                                                                           { tag: 'value',
                                                                                                                             value: { value: _descriptor_12.toValue(3n),
                                                                                                                                      alignment: _descriptor_12.alignment() } }] } },
                                                                                                           { popeq: { cached: true,
                                                                                                                      result: undefined } }]).value));
    return this._publicKey_0(instB_0,
                             this._userSecretKey_0(context, partialProofData));
  }
  _createUserHash_0(name_0, dob_0) {
    return this._persistentHash_0([new Uint8Array([101, 99, 108, 105, 112, 115, 101, 58, 117, 115, 101, 114, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   name_0,
                                   dob_0]);
  }
  _getUserHash_0(context, partialProofData) {
    return this._createUserHash_0(this._userName_0(context, partialProofData),
                                  this._userDateOfBirth_0(context,
                                                          partialProofData));
  }
  _getCurrentTimestamp_0(context, partialProofData) {
    return ((t1) => {
             if (t1 > 18446744073709551615n) {
               throw new __compactRuntime.CompactError('eclipseproof.compact line 95 char 12: cast from field value to Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
             }
             return t1;
           })(_descriptor_5.fromValue(Contract._query(context,
                                                      partialProofData,
                                                      [
                                                       { dup: { n: 0 } },
                                                       { idx: { cached: false,
                                                                pushPath: false,
                                                                path: [
                                                                       { tag: 'value',
                                                                         value: { value: _descriptor_12.toValue(2n),
                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                       { popeq: { cached: true,
                                                                  result: undefined } }]).value));
  }
  _bumpEpoch_0(context, partialProofData) {
    this._assertOnlyOwner_0(context, partialProofData);
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_12.toValue(2n),
                                                alignment: _descriptor_12.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_9.toValue(tmp_0),
                                              alignment: _descriptor_9.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _setMinNetPayThreshold_0(context, partialProofData, threshold_0) {
    this._assertOnlyOwner_0(context, partialProofData);
    __compactRuntime.assert(threshold_0 > 0n, 'threshold must be > 0');
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(6n),
                                                                            alignment: _descriptor_12.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(threshold_0),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _revokeEarningsProof_0(context, partialProofData, userPk_0) {
    this._assertOnlyOwner_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_0.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_12.toValue(4n),
                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                     { push: { storage: false,
                                                                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                                                                     'member',
                                                                     { popeq: { cached: true,
                                                                                result: undefined } }]).value),
                            'no proof found');
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_12.toValue(4n),
                                                alignment: _descriptor_12.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { rem: { cached: false } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _enrollAndProveEarnings_0(context, partialProofData) {
    const userPk_0 = this._userPublicKey_0(context, partialProofData);
    __compactRuntime.assert(!_descriptor_0.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_12.toValue(4n),
                                                                                                 alignment: _descriptor_12.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                                                                             alignment: _descriptor_1.alignment() }).encode() } },
                                                                      'member',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value),
                            'already enrolled');
    __compactRuntime.assert(this._netPayFromPayslip_0(context, partialProofData)
                            >=
                            _descriptor_5.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_12.toValue(6n),
                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                     { popeq: { cached: false,
                                                                                result: undefined } }]).value),
                            'net pay below threshold');
    __compactRuntime.assert(this._claimedEarnings_0(context, partialProofData)
                            <=
                            this._netPayFromPayslip_0(context, partialProofData),
                            'claimed earnings exceed net pay');
    const userHash_0 = this._getUserHash_0(context, partialProofData);
    const timestamp_0 = this._getCurrentTimestamp_0(context, partialProofData);
    const currentEpoch_0 = ((t1) => {
                             if (t1 > 18446744073709551615n) {
                               throw new __compactRuntime.CompactError('eclipseproof.compact line 136 char 26: cast from field value to Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                             }
                             return t1;
                           })(_descriptor_5.fromValue(Contract._query(context,
                                                                      partialProofData,
                                                                      [
                                                                       { dup: { n: 0 } },
                                                                       { idx: { cached: false,
                                                                                pushPath: false,
                                                                                path: [
                                                                                       { tag: 'value',
                                                                                         value: { value: _descriptor_12.toValue(2n),
                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                       { popeq: { cached: true,
                                                                                  result: undefined } }]).value));
    const tmp_0 = { epoch: currentEpoch_0,
                    userHash: userHash_0,
                    claimedAmount:
                      this._claimedEarnings_0(context, partialProofData),
                    verified: 1n,
                    timestamp: timestamp_0 };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_12.toValue(4n),
                                                alignment: _descriptor_12.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                            alignment: _descriptor_7.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _updateEarningsProof_0(context, partialProofData) {
    const userPk_0 = this._userPublicKey_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_0.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_12.toValue(4n),
                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                     { push: { storage: false,
                                                                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                                                                     'member',
                                                                     { popeq: { cached: true,
                                                                                result: undefined } }]).value),
                            'not enrolled');
    __compactRuntime.assert(this._netPayFromPayslip_0(context, partialProofData)
                            >=
                            _descriptor_5.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_12.toValue(6n),
                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                     { popeq: { cached: false,
                                                                                result: undefined } }]).value),
                            'net pay below threshold');
    __compactRuntime.assert(this._claimedEarnings_0(context, partialProofData)
                            <=
                            this._netPayFromPayslip_0(context, partialProofData),
                            'claimed earnings exceed net pay');
    const userHash_0 = this._getUserHash_0(context, partialProofData);
    const timestamp_0 = this._getCurrentTimestamp_0(context, partialProofData);
    const currentEpoch_0 = ((t1) => {
                             if (t1 > 18446744073709551615n) {
                               throw new __compactRuntime.CompactError('eclipseproof.compact line 160 char 26: cast from field value to Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                             }
                             return t1;
                           })(_descriptor_5.fromValue(Contract._query(context,
                                                                      partialProofData,
                                                                      [
                                                                       { dup: { n: 0 } },
                                                                       { idx: { cached: false,
                                                                                pushPath: false,
                                                                                path: [
                                                                                       { tag: 'value',
                                                                                         value: { value: _descriptor_12.toValue(2n),
                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                       { popeq: { cached: true,
                                                                                  result: undefined } }]).value));
    const tmp_0 = { epoch: currentEpoch_0,
                    userHash: userHash_0,
                    claimedAmount:
                      this._claimedEarnings_0(context, partialProofData),
                    verified: 1n,
                    timestamp: timestamp_0 };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_12.toValue(4n),
                                                alignment: _descriptor_12.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                            alignment: _descriptor_7.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _createVerificationRequest_0(context,
                               partialProofData,
                               targetUserHash_0,
                               requiredAmount_0)
  {
    const requesterId_0 = this._userPublicKey_0(context, partialProofData);
    const requestId_0 = this._persistentHash_1([new Uint8Array([101, 99, 108, 105, 112, 115, 101, 58, 114, 101, 113, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                targetUserHash_0,
                                                requesterId_0,
                                                __compactRuntime.convert_bigint_to_Uint8Array(32,
                                                                                              requiredAmount_0)]);
    const tmp_0 = { userHash: targetUserHash_0,
                    requiredAmount: requiredAmount_0,
                    requesterId: requesterId_0 };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_12.toValue(5n),
                                                alignment: _descriptor_12.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(requestId_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(tmp_0),
                                                                            alignment: _descriptor_8.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return requestId_0;
  }
  _verifyEarningsByHash_0(targetUserHash_0, requiredAmount_0) { return 0n; }
  _verifyEarningsByUserPk_0(context,
                            partialProofData,
                            userPk_0,
                            expectedUserHash_0,
                            requiredAmount_0)
  {
    __compactRuntime.assert(_descriptor_0.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_12.toValue(4n),
                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                     { push: { storage: false,
                                                                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                                                                     'member',
                                                                     { popeq: { cached: true,
                                                                                result: undefined } }]).value),
                            'no proof found');
    const proof_0 = _descriptor_7.fromValue(Contract._query(context,
                                                            partialProofData,
                                                            [
                                                             { dup: { n: 0 } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_12.toValue(4n),
                                                                                        alignment: _descriptor_12.alignment() } }] } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_1.toValue(userPk_0),
                                                                                        alignment: _descriptor_1.alignment() } }] } },
                                                             { popeq: { cached: false,
                                                                        result: undefined } }]).value);
    __compactRuntime.assert(this._equal_3(proof_0.userHash, expectedUserHash_0),
                            'user hash mismatch');
    const meetsRequirement_0 = proof_0.claimedAmount >= requiredAmount_0
                               &&
                               this._equal_4(proof_0.verified, 1n)
                               ?
                               1n :
                               0n;
    return meetsRequirement_0;
  }
  _getEpoch_0(context, partialProofData) {
    return ((t1) => {
             if (t1 > 18446744073709551615n) {
               throw new __compactRuntime.CompactError('eclipseproof.compact line 240 char 12: cast from field value to Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
             }
             return t1;
           })(_descriptor_5.fromValue(Contract._query(context,
                                                      partialProofData,
                                                      [
                                                       { dup: { n: 0 } },
                                                       { idx: { cached: false,
                                                                pushPath: false,
                                                                path: [
                                                                       { tag: 'value',
                                                                         value: { value: _descriptor_12.toValue(2n),
                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                       { popeq: { cached: true,
                                                                  result: undefined } }]).value));
  }
  _getInstanceBytes_0(context, partialProofData) {
    return __compactRuntime.convert_bigint_to_Uint8Array(32,
                                                         _descriptor_5.fromValue(Contract._query(context,
                                                                                                 partialProofData,
                                                                                                 [
                                                                                                  { dup: { n: 0 } },
                                                                                                  { idx: { cached: false,
                                                                                                           pushPath: false,
                                                                                                           path: [
                                                                                                                  { tag: 'value',
                                                                                                                    value: { value: _descriptor_12.toValue(3n),
                                                                                                                             alignment: _descriptor_12.alignment() } }] } },
                                                                                                  { popeq: { cached: true,
                                                                                                             result: undefined } }]).value));
  }
  _getMinNetPayThreshold_0(context, partialProofData) {
    return _descriptor_5.fromValue(Contract._query(context,
                                                   partialProofData,
                                                   [
                                                    { dup: { n: 0 } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_12.toValue(6n),
                                                                               alignment: _descriptor_12.alignment() } }] } },
                                                    { popeq: { cached: false,
                                                               result: undefined } }]).value);
  }
  _getMyEarningsProof_0(context, partialProofData) {
    const userPk_0 = this._userPublicKey_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_0.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_12.toValue(4n),
                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                     { push: { storage: false,
                                                                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                                                                     'member',
                                                                     { popeq: { cached: true,
                                                                                result: undefined } }]).value),
                            'no proof found');
    return _descriptor_7.fromValue(Contract._query(context,
                                                   partialProofData,
                                                   [
                                                    { dup: { n: 0 } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_12.toValue(4n),
                                                                               alignment: _descriptor_12.alignment() } }] } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_1.toValue(userPk_0),
                                                                               alignment: _descriptor_1.alignment() } }] } },
                                                    { popeq: { cached: false,
                                                               result: undefined } }]).value);
  }
  _getEarningsProofByPk_0(context, partialProofData, userPk_0) {
    __compactRuntime.assert(_descriptor_0.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_12.toValue(4n),
                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                     { push: { storage: false,
                                                                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                                                                     'member',
                                                                     { popeq: { cached: true,
                                                                                result: undefined } }]).value),
                            'no proof found');
    return _descriptor_7.fromValue(Contract._query(context,
                                                   partialProofData,
                                                   [
                                                    { dup: { n: 0 } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_12.toValue(4n),
                                                                               alignment: _descriptor_12.alignment() } }] } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_1.toValue(userPk_0),
                                                                               alignment: _descriptor_1.alignment() } }] } },
                                                    { popeq: { cached: false,
                                                               result: undefined } }]).value);
  }
  _checkEarningsThreshold_0(context, partialProofData, userPk_0, threshold_0) {
    __compactRuntime.assert(_descriptor_0.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_12.toValue(4n),
                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                     { push: { storage: false,
                                                                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(userPk_0),
                                                                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                                                                     'member',
                                                                     { popeq: { cached: true,
                                                                                result: undefined } }]).value),
                            'no proof found');
    const proof_0 = _descriptor_7.fromValue(Contract._query(context,
                                                            partialProofData,
                                                            [
                                                             { dup: { n: 0 } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_12.toValue(4n),
                                                                                        alignment: _descriptor_12.alignment() } }] } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_1.toValue(userPk_0),
                                                                                        alignment: _descriptor_1.alignment() } }] } },
                                                             { popeq: { cached: false,
                                                                        result: undefined } }]).value);
    const meetsThreshold_0 = proof_0.claimedAmount >= threshold_0
                             &&
                             this._equal_5(proof_0.verified, 1n)
                             ?
                             1n :
                             0n;
    return meetsThreshold_0;
  }
  _owner_1(context, partialProofData) {
    return this._owner_0(context, partialProofData);
  }
  _transferOwnership_1(context, partialProofData, newOwner_0) {
    this._transferOwnership_0(context, partialProofData, newOwner_0); return [];
  }
  _renounceOwnership_1(context, partialProofData) {
    this._renounceOwnership_0(context, partialProofData); return [];
  }
  _equal_0(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_1(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_2(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.transactionContext.query(prog, __compactRuntime.CostModel.dummyCostModel());
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.transactionContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get epoch() {
      return _descriptor_5.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_12.toValue(2n),
                                                                                 alignment: _descriptor_12.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    },
    get instance() {
      return _descriptor_5.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_12.toValue(3n),
                                                                                 alignment: _descriptor_12.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    },
    earningsProofs: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_12.toValue(4n),
                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                                               alignment: _descriptor_5.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_12.toValue(4n),
                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'eclipseproof.compact line 40 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_12.toValue(4n),
                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_0),
                                                                                                               alignment: _descriptor_1.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'eclipseproof.compact line 40 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_7.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_12.toValue(4n),
                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_1.toValue(key_0),
                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_7.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    verificationRequests: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_12.toValue(5n),
                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                                               alignment: _descriptor_5.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_12.toValue(5n),
                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'eclipseproof.compact line 43 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_12.toValue(5n),
                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_0),
                                                                                                               alignment: _descriptor_1.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'eclipseproof.compact line 43 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_8.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_12.toValue(5n),
                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_1.toValue(key_0),
                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[5];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_8.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get minNetPayThreshold() {
      return _descriptor_5.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_12.toValue(6n),
                                                                                 alignment: _descriptor_12.alignment() } }] } },
                                                      { popeq: { cached: false,
                                                                 result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  userSecretKey: (...args) => undefined,
  userName: (...args) => undefined,
  userDateOfBirth: (...args) => undefined,
  netPayFromPayslip: (...args) => undefined,
  claimedEarnings: (...args) => undefined
});
const pureCircuits = {
  publicKey: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`publicKey: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const inst_0 = args_0[0];
    const sk_0 = args_0[1];
    if (!(inst_0.buffer instanceof ArrayBuffer && inst_0.BYTES_PER_ELEMENT === 1 && inst_0.length === 32)) {
      __compactRuntime.type_error('publicKey',
                                  'argument 1',
                                  'eclipseproof.compact line 75 char 1',
                                  'Bytes<32>',
                                  inst_0)
    }
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.type_error('publicKey',
                                  'argument 2',
                                  'eclipseproof.compact line 75 char 1',
                                  'Bytes<32>',
                                  sk_0)
    }
    return _dummyContract._publicKey_0(inst_0, sk_0);
  },
  createUserHash: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`createUserHash: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const name_0 = args_0[0];
    const dob_0 = args_0[1];
    if (!(name_0.buffer instanceof ArrayBuffer && name_0.BYTES_PER_ELEMENT === 1 && name_0.length === 32)) {
      __compactRuntime.type_error('createUserHash',
                                  'argument 1',
                                  'eclipseproof.compact line 85 char 1',
                                  'Bytes<32>',
                                  name_0)
    }
    if (!(dob_0.buffer instanceof ArrayBuffer && dob_0.BYTES_PER_ELEMENT === 1 && dob_0.length === 32)) {
      __compactRuntime.type_error('createUserHash',
                                  'argument 2',
                                  'eclipseproof.compact line 85 char 1',
                                  'Bytes<32>',
                                  dob_0)
    }
    return _dummyContract._createUserHash_0(name_0, dob_0);
  },
  verifyEarningsByHash: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`verifyEarningsByHash: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const targetUserHash_0 = args_0[0];
    const requiredAmount_0 = args_0[1];
    if (!(targetUserHash_0.buffer instanceof ArrayBuffer && targetUserHash_0.BYTES_PER_ELEMENT === 1 && targetUserHash_0.length === 32)) {
      __compactRuntime.type_error('verifyEarningsByHash',
                                  'argument 1',
                                  'eclipseproof.compact line 200 char 1',
                                  'Bytes<32>',
                                  targetUserHash_0)
    }
    if (!(typeof(requiredAmount_0) === 'bigint' && requiredAmount_0 >= 0n && requiredAmount_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('verifyEarningsByHash',
                                  'argument 2',
                                  'eclipseproof.compact line 200 char 1',
                                  'Uint<0..18446744073709551615>',
                                  requiredAmount_0)
    }
    return _dummyContract._verifyEarningsByHash_0(targetUserHash_0,
                                                  requiredAmount_0);
  }
};
const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
exports.contractReferenceLocations = contractReferenceLocations;
//# sourceMappingURL=index.cjs.map
