import { ActionTree } from 'vuex';
import { RootState } from '@/store';
import axios from 'axios';

import { getResponseData } from '@/stuff';

import {
  IUsersState,
  IUser,
  IUserRole,
  USER_INVITE,
  USER_SEARCH,
  USERS_FETCH_ALL,
  USERS_FETCH_ONE,
  USER_ASSIGN_EQUIPMENT,
  USER_REMOVE_EQUIPMENT,
  USER_ROLES_FETCH,
  USER_ROLE_ASSIGN,
  USER_ROLE_DISCHARGE,
  USERS_SET_ALL,
  USERS_SET_ONE,
  USER_ROLES_SET_ALL,
  USER_PROPERTY_TYPE_COMMIT,
  USER_PROPERTY_TYPES_SET_ONE,
  USER_PROPERTY_TYPES_FETCH_ALL,
  USER_PROPERTY_TYPES_SET_ALL,
  USER_PROPERTIES_FETCH_ALL,
  USER_PROPERTY_COMMIT,
  USER_PROPERTY_DELETE,
  IUserPropertyType,
  USER_PROPERTY_TYPES_REMOVE_ONE,
  IUserProperty,
  USER_PROPERTY_TYPE_DELETE
} from './types';

import { IEquipment } from '@/modules/equipment';
import { resolve } from 'path';
import { rejects } from 'assert';

export const actions: ActionTree<IUsersState, RootState> = {
  [USER_INVITE]: ({ }, { email }: { email: string }) => {
    return new Promise((resolve, reject) => {
      axios
        .post('user', {
          email,
          redirectUrl: window.location.origin
        })
        .then((response) => {
          const body = response.data;

          if (response.status === 200 || response.status === 204) {
            resolve();
          } else {
            reject();
          }
        })
        .catch((error) => {
          console.log(USER_INVITE, error);
          reject(error);
        });
    });
  },

  [USER_SEARCH]: (
    { },
    { match = '', all = false }: { match?: string; all?: boolean }
  ) => {
    return new Promise((resolve, reject) => {
      axios
        .get(`user?match=${encodeURIComponent(match)}&count=${all ? -1 : 5}`)
        .then((response) => getResponseData<IUser[]>(response))
        .then((users) => resolve(users))
        .catch((error) => {
          console.log(USER_SEARCH, error);
          reject(error);
        });
    });
  },

  [USERS_FETCH_ALL]: ({ commit }) => {
    return new Promise((resolve, reject) => {
      axios
        .get('user?count=-1')
        .then((response) => getResponseData<IUser[]>(response))
        .then((users) => {
          commit(USERS_SET_ALL, users);
          resolve(users);
        })
        .catch((error) => {
          console.log(USERS_FETCH_ALL, error);
          reject(error);
        });
    });
  },

  [USERS_FETCH_ONE]: ({ commit }, id: string) => {
    return new Promise((resolve, reject) => {
      axios
        .get(`user/${id}`)
        .then((response) => getResponseData<IUser>(response))
        .then((user) => {
          commit(USERS_SET_ONE, user);
          resolve(user);
        })
        .catch((error) => {
          console.log(USERS_FETCH_ONE, error);
          reject(error);
        });
    });
  },

  [USER_ASSIGN_EQUIPMENT]: (
    { },
    { equipment, user }: { equipment: IEquipment; user: IUser | string | null }
  ) => {
    return new Promise((resolve, reject) => {
      let url: string = 'equipment/user';
      if (user) {
        if (typeof user === 'string') {
          url += `/${user as string}`;
        } else if ('id' in (user as any)) {
          url += `/${(user as any).id}`;
        }
      }

      axios
        .post(url, { id: equipment.id })
        .then((response) => getResponseData<IEquipment>(response))
        .then((equipment) => resolve(equipment))
        .catch((error) => {
          console.log(USER_ASSIGN_EQUIPMENT, error);
          reject(error);
        });
    });
  },

  [USER_REMOVE_EQUIPMENT]: (
    { },
    {
      equipment,
      owner
    }: { equipment: IEquipment; owner: IUser | string | null }
  ) => {
    return new Promise((resolve, reject) => {
      let url: string = 'equipment/user';
      if (owner) {
        if (typeof owner === 'string') {
          url += `/${owner as string}`;
        } else if ('id' in (owner as any)) {
          url += `/${(owner as any).id}`;
        }
      }

      axios
        .delete(url, { data: { id: equipment.id } })
        .then((response) => getResponseData<IEquipment>(response))
        .then((equipment) => resolve(equipment))
        .catch((error) => {
          console.log(USER_REMOVE_EQUIPMENT, error);
          reject(error);
        });
    });
  },

  [USER_ROLES_FETCH]: ({ commit }, user?: IUser | string) => {
    return new Promise((resolve, reject) => {
      const userId = user
        ? typeof user === 'string'
          ? user
          : user.id
        : undefined;

      axios
        .get(`roles/${userId || ''}`)
        .then((response) => getResponseData<IUserRole[]>(response))
        .then((userRoles) => {
          if (user) {
            commit(USER_ROLES_SET_ALL, userRoles);
          }
          resolve(userRoles);
        })
        .catch((error) => {
          console.log(USER_ROLES_FETCH, error);
          reject(error);
        });
    });
  },

  [USER_ROLE_ASSIGN]: (
    { },
    { user, role }: { user: IUser | string; role: IUserRole | string }
  ) => {
    return new Promise((resolve, reject) => {
      const userId = typeof user === 'string' ? user : user.id;
      const roleId = typeof role === 'string' ? role : role.id;
      axios
        .post(`roles/${userId}/${roleId}`)
        .then((response) => {
          const body = response.data;

          if (response.status === 200 || response.status === 204) {
            resolve();
          } else {
            reject();
          }
        })
        .catch((error) => {
          console.log(USER_ROLE_ASSIGN, error);
          reject(error);
        });
    });
  },

  [USER_ROLE_DISCHARGE]: (
    { },
    { user, role }: { user: IUser | string; role: IUserRole | string }
  ) => {
    return new Promise((resolve, reject) => {
      const userId = typeof user === 'string' ? user : user.id;
      const roleId = typeof role === 'string' ? role : role.id;
      axios
        .delete(`roles/${userId}/${roleId}`)
        .then((response) => {
          const body = response.data;

          if (response.status === 200 || response.status === 204) {
            resolve();
          } else {
            reject();
          }
        })
        .catch((error) => {
          console.log(USER_ROLE_DISCHARGE, error);
          reject(error);
        });
    });
  },

  [USER_PROPERTY_TYPE_COMMIT]: ({ commit }, userPropertyType: IUserPropertyType) => {
    return new Promise((resolve, reject) => {
      const url = 'account/property/type';

      const request =
        userPropertyType.id === ''
          ? axios.post(url, userPropertyType)
          : axios.put(`account/property/type/${userPropertyType.id}`, {
            title: userPropertyType.title,
            description: userPropertyType.description
          });

      request
        .then((response) => getResponseData<IUserPropertyType>(response))
        .then((userPropertyType) => {
          commit(USER_PROPERTY_TYPES_SET_ONE, userPropertyType);
          resolve(userPropertyType);
        })
        .catch((error) => {
          console.log(USER_PROPERTY_TYPE_COMMIT, error);
          reject(error);
        });
    });
  },

  [USER_PROPERTY_TYPES_FETCH_ALL]: ({ commit }) => {
    return new Promise((resolve, reject) => {
      axios
        .get('account/property/type')
        .then((response: any) => getResponseData<IUserPropertyType[]>(response))
        .then((userPropertyTypes) => {
          commit(USER_PROPERTY_TYPES_SET_ALL, userPropertyTypes);
          resolve(userPropertyTypes);
        })
        .catch((error) => {
          console.log(USER_PROPERTY_TYPES_SET_ALL, error);
          reject(error);
        });
    });
  },

  [USER_PROPERTY_TYPE_DELETE]: (
    { commit },
    userPropertyType: IUserPropertyType
  ) => {
    return new Promise((resolve, reject) => {
      const id = userPropertyType.id;
      axios
        .delete(`account/property/type/${id}`)
        .then((response) => {
          if (response.status === 200 || response.status === 201 || response.status === 204) {
            commit(USER_PROPERTY_TYPES_REMOVE_ONE, id);
            resolve();
          } else {
            reject();
          }
        })
        .catch((error) => {
          console.log(USER_PROPERTY_TYPE_DELETE, error);
          reject(error);
        });
    });
  },

  [USER_PROPERTIES_FETCH_ALL]: () => {
    return new Promise((resolve, reject) => {
      axios
        .get('account/property')
        .then((response: any) => getResponseData<IUserProperty[]>(response))
        .then((userProperties) => {
          resolve(userProperties);
        })
        .catch((error) => {
          console.log(USER_PROPERTY_TYPES_SET_ALL, error);
          reject(error);
        });
    });
  },

  [USER_PROPERTY_COMMIT]: ({ commit }, {
    userPropertyValue,
    userPropertyId,
  }) => {
    return new Promise((resolve, reject) => {
      axios
        .put('account/property', { value: userPropertyValue, id: userPropertyId })
        .then((response) => getResponseData<IUserProperty>(response))
        .then((userProperty) => {
          resolve(userProperty);
        })
        .catch((error) => {
          console.log(USER_PROPERTY_TYPES_SET_ALL, error);
          reject(error);
        });
    });
  },

  [USER_PROPERTY_DELETE]: ({ }, {
    userPropertyId
  }) => {
    return new Promise((resolve, reject) => {
      axios
        .delete('account/property', { data: { id: userPropertyId } })
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          console.log(USER_PROPERTY_TYPES_SET_ALL, error);
          reject(error);
        });
    });
  }
};
