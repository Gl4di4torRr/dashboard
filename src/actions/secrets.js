/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { createCredential, deleteCredential, getCredentials } from '../api';
import { getSelectedNamespace } from '../reducers';

export function fetchSecretsSuccess(data) {
  return {
    type: 'SECRETS_FETCH_SUCCESS',
    data
  };
}

export function fetchSecrets({ namespace } = {}) {
  return async (dispatch, getState) => {
    dispatch({ type: 'SECRETS_FETCH_REQUEST' });
    let secrets;
    try {
      const selectedNamespace = namespace || getSelectedNamespace(getState());
      secrets = await getCredentials(selectedNamespace);
      const secretsFormatted = [];
      secrets.forEach(secret => {
        const object = {
          name: secret.name,
          namespace: secret.namespace,
          annotations: secret.url
        };
        secretsFormatted.push(object);
      });
      dispatch(fetchSecretsSuccess(secretsFormatted));
    } catch (e) {
      const error = new Error('Could not fetch secrets');
      dispatch({ type: 'SECRETS_FETCH_FAILURE', error });
    }
    return secrets;
  };
}

export function deleteSecret(name, namespace) {
  return async dispatch => {
    dispatch({ type: 'SECRET_DELETE_REQUEST' });
    try {
      await deleteCredential(name, namespace);
      dispatch({ type: 'SECRET_DELETE_SUCCESS', name, namespace });
    } catch (e) {
      const error = new Error(`Could not delete secret "${name}"`);
      dispatch({ type: 'SECRET_DELETE_FAILURE', error });
    }
  };
}

/* istanbul ignore next */
export function createSecret(postData, namespace) {
  return async dispatch => {
    dispatch({ type: 'SECRET_CREATE_REQUEST' });
    try {
      await createCredential(postData, namespace);
      dispatch(fetchSecrets());
    } catch (e) {
      const error = new Error(
        `Could not create secret "${postData.name}" in namespace ${namespace}`
      );
      dispatch({ type: 'SECRET_CREATE_FAILURE', error });
    }
  };
}

export function clearNotification() {
  return { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' };
}
