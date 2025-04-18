/*
 * Copyright 2019 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Resolver, ResolverListener, registerResolver } from './resolver';
import { Endpoint } from './subchannel-address';
import { GrpcUri } from './uri-parser';
import { ChannelOptions } from './channel-options';
import { statusOrFromValue } from './call-interface';

class UdsResolver implements Resolver {
  private hasReturnedResult = false;
  private endpoints: Endpoint[] = [];
  constructor(
    target: GrpcUri,
    private listener: ResolverListener,
    channelOptions: ChannelOptions
  ) {
    let path: string;
    if (target.authority === '') {
      path = '/' + target.path;
    } else {
      path = target.path;
    }
    this.endpoints = [{ addresses: [{ path }] }];
  }
  updateResolution(): void {
    if (!this.hasReturnedResult) {
      this.hasReturnedResult = true;
      process.nextTick(
        this.listener,
        statusOrFromValue(this.endpoints),
        {},
        null,
        ''
      );
    }
  }

  destroy() {
    this.hasReturnedResult = false;
  }

  static getDefaultAuthority(target: GrpcUri): string {
    return 'localhost';
  }
}

export function setup() {
  registerResolver('unix', UdsResolver);
}
