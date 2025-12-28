import {
  type CounterProviders,
  CounterPrivateStateId,
} from "../api/common-types";
import { type ContractAddress } from "@midnight-ntwrk/compact-runtime";
import { BehaviorSubject } from "rxjs";
import { type Logger } from "pino";
import { type LocalStorageProps } from "./counter-localStorage-class";
import {
  ContractController,
  ContractControllerInterface,
} from "../api/contractController";

export type ContractDeployment =  
  | InProgressContractDeployment
  | DeployedContract
  | FailedContractDeployment;

export interface InProgressContractDeployment {
  readonly status: "in-progress";
  readonly address?: ContractAddress;
}

export interface DeployedContract {
  readonly status: "deployed";
  readonly api: ContractControllerInterface;
  readonly address: ContractAddress;
}

export interface FailedContractDeployment {
  readonly status: "failed";
  readonly error: Error;
  readonly address?: ContractAddress;
}

export interface ContractFollow {
  readonly observable: BehaviorSubject<ContractDeployment>;
  address?: ContractAddress;
}

export interface DeployedAPIProvider {  
  readonly joinContract: () => ContractFollow;
  readonly deployContract: () => Promise<ContractFollow>;
}

export class DeployedTemplateManager implements DeployedAPIProvider {
  constructor(
    private readonly logger: Logger,
    private readonly localState: LocalStorageProps,    
    private readonly contractAddress: ContractAddress,
    private readonly providers?: CounterProviders
  ) {}

  joinContract(): ContractFollow {
    const deployment = new BehaviorSubject<ContractDeployment>({
      status: "in-progress",
      address: this.contractAddress,
    });
    const contractFollow = {
      observable: deployment,
      address: this.contractAddress,
    };

    void this.join(deployment, this.contractAddress);

    return contractFollow;
  }

  async deployContract(): Promise<ContractFollow> {
    const deployment = new BehaviorSubject<ContractDeployment>({
      status: "in-progress",
    });

    const address = await this.deploy(deployment);

    return { observable: deployment, address };
  }

  private async deploy(
    deployment: BehaviorSubject<ContractDeployment>
  ): Promise<string | undefined> {
    try {
      if (this.providers) {
        const api = await ContractController.deploy(
          CounterPrivateStateId,
          this.providers,
          this.logger
        );
        // this.localState.setContractPrivateId(CounterPrivateStateId, api.deployedContractAddress);
        this.localState.addContract(api.deployedContractAddress);

        deployment.next({
          status: "deployed",
          api,
          address: api.deployedContractAddress,
        });
        return api.deployedContractAddress;
      } else {
        deployment.next({
          status: "failed",
          error: new Error("Providers are not available"),
        });
      }
    } catch (error: unknown) {
      this.logger.error(error);
      deployment.next({
        status: "failed",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
    return undefined;
  }

  private async join(
    deployment: BehaviorSubject<ContractDeployment>,
    contractAddress: ContractAddress
  ): Promise<void> {
    try {
      if (this.providers) {
        // const item = this.localState.getContractPrivateId(contractAddress);

        // if (item != null) {
        // } else {
        //   this.localState.setContractPrivateId(CounterPrivateStateId, contractAddress);
        // }
        const api = await ContractController.join(
          CounterPrivateStateId,
          this.providers,
          contractAddress,
          this.logger
        );

        deployment.next({
          status: "deployed",
          api,
          address: api.deployedContractAddress,
        });
      } else {
        deployment.next({
          status: "failed",
          error: new Error("Providers are not available"),
        });
      }
    } catch (error: unknown) {
      this.logger.error(error);
      deployment.next({
        status: "failed",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}
