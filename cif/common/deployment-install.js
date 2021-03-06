/*
 * Copyright 2019 diconium
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

"use strict";

const yaml = require('js-yaml');
const fs = require('fs');
const child_process = require('child_process');

/**
 * This script downloads additional dependencies specified in serverless.yml
 * files via the ccif_dependency property. The dependencies are downloaded
 * and unpacked.
 */

// Read serverless file
const serverless = yaml.safeLoad(fs.readFileSync('serverless.yml', 'utf8'));

// Parse module dependencies
let dependencies = new Set();
for(let action in serverless.functions) {
  const a = serverless.functions[action]
  if(a.hasOwnProperty('ccif_dependency')) {
    dependencies.add(a.ccif_dependency);
  }
}

// Provision dependencies
for(let dependency of dependencies) {
  // Download dependencies, unpack them and install their production dependencies
  child_process.execSync(`TARBALL=$(npm pack '${dependency}')` +
    ` && mkdir -p '${dependency}'` +
    ` && tar xvf $TARBALL -C '${dependency}' --strip 1` +
    ` && rm $TARBALL` +
    ` && cd '${dependency}'` +
    ` && npm install --only=production`, {stdio: 'inherit'});
}