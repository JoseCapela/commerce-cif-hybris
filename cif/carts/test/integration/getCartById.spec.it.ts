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

import { getById as getCartById } from '../../src/actions/carts';
import { TestUtils } from '../../../common/TestUtils';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');

chai.use(chaiShallowDeepEqual);
chai.use(chaiHttp);
const { expect } = chai;

const validInput = require('../resources/validateGetCartByIdValid.json');
const validInputOauth = require('../resources/validateGetCartByIdValidWithOauth.json');

describe('getCartById', function () {
  this.timeout(25000);
  describe('Integration tests',  () => {

    before(async() => {
      chai.request(TestUtils.getHybrisInstance() + 'rest/v2/electronics/users/anonymous/')
        .post('carts')
        .then((response) => {
          validInput.parameters.id = response.body.guid;
        });

      validInputOauth.settings.bearer = await TestUtils.getBearer();
      return chai.request(TestUtils.getHybrisInstance() + 'rest/v2/electronics/users/current/')
        .post(`carts?access_token=${validInputOauth.settings.bearer}`)
        .then((response) => {
          validInputOauth.parameters.id = response.body.code;
          validInputOauth.settings.customerId = 'current';
        });

    });

    after(() => {
      return TestUtils.deleteCartById(validInput.parameters.id);
    });

    it('Response should be 200 if the cart exists with that number for the anonymous user', async () => {
      const { response } = await getCartById(validInput);
      const { statusCode, body } = response;
      expect(statusCode).to.be.equal(200);
      expect(body).to.be.ok.and.to.haveOwnProperty('id').and.to.equal(validInput.parameters.id);
    });

    // For this test to execute the login interface needs to be available
    xit('Response should be 200 if the cart exists with that number for the current user if bearer is valid', async () => {
      const {  response } = await getCartById(validInputOauth);
      const { statusCode, body } = response;
      expect(statusCode).to.be.equal(200);
      expect(body).to.be.ok.and.to.haveOwnProperty('id').and.to.equal(validInputOauth.parameters.id);
    });
  });
});
