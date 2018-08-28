import { ActionTree } from 'vuex';
import { RootState } from '@/store';
import moment from 'moment-timezone';
import axios from 'axios';

import { getResponseData } from '@/stuff';

import {
  NotificationsState,
  EventNotification,
  Invitation,
  Wish,
  NOTIFICATION_INVITATION_ACCEPT,
  NOTIFICATION_INVITATION_REJECT,
  NOTIFICATION_INVITATIONS_FETCH,
  NOTIFICATION_INVITATIONS_SET_ALL,
  NOTIFICATION_INVITATIONS_REMOVE_ONE,
  NOTIFICATION_WISH_ACCEPT,
  NOTIFICATION_WISH_REJECT,
  NOTIFICATION_WISHES_FETCH,
  NOTIFICATION_WISHES_SET_ALL,
  NOTIFICATION_WISHES_REMOVE_ONE,
  NOTIFICATIONS_FETCH
} from './types';

const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

const fixDates = (notification: EventNotification) => {
  if (notification.beginTime) {
    notification.beginTime = moment(
      notification.beginTime,
      DATETIME_FORMAT + 'Z'
    ).toDate();

    notification.creationTime = moment(
      notification.creationTime,
      DATETIME_FORMAT + 'Z'
    ).toDate();
  }
};

export const actions: ActionTree<NotificationsState, RootState> = {
  [NOTIFICATION_INVITATION_ACCEPT]: ({ commit }, invitation: Invitation) => {
    return new Promise((resolve, reject) => {
      axios
        .post(`event/invitation/${invitation.placeId}/accept`)
        .then((response) => {
          commit(NOTIFICATION_INVITATIONS_REMOVE_ONE, invitation);
          resolve();
        })
        .catch((error) => {
          console.log(NOTIFICATION_INVITATION_ACCEPT, error);
          reject();
        });
    });
  },

  [NOTIFICATION_INVITATION_REJECT]: ({ commit }, invitation: Invitation) => {
    return new Promise((resolve, reject) => {
      axios
        .post(`event/invitation/${invitation.placeId}/reject`)
        .then((response) => {
          commit(NOTIFICATION_INVITATIONS_REMOVE_ONE, invitation);
          resolve();
        })
        .catch((error) => {
          console.log(NOTIFICATION_INVITATION_ACCEPT, error);
          reject();
        });
    });
  },

  [NOTIFICATION_INVITATIONS_FETCH]: ({ commit }) => {
    return new Promise((resolve, reject) => {
      axios
        .get('event/applications/invitations')
        .then((response) => getResponseData<Invitation[]>(response))
        .then((eventInvitations) => {
          eventInvitations.forEach(fixDates);
          commit(NOTIFICATION_INVITATIONS_SET_ALL, eventInvitations);
          resolve(eventInvitations);
        })
        .catch((error) => {
          console.log(NOTIFICATION_INVITATIONS_FETCH, error);
          reject();
        });
    });
  },

  [NOTIFICATION_WISH_ACCEPT]: ({ commit }, wishApplication: Wish) => {
    return new Promise((resolve, reject) => {
      axios
        .post(
          `event/wish/${wishApplication.placeId}/${
            wishApplication.user.id
          }/accept`
        )
        .then((response) => {
          commit(NOTIFICATION_WISHES_REMOVE_ONE, wishApplication);
          resolve();
        })
        .catch((error) => {
          console.log(NOTIFICATION_WISH_ACCEPT, error);
          reject();
        });
    });
  },

  [NOTIFICATION_WISH_REJECT]: ({ commit }, wishApplication: Wish) => {
    return new Promise((resolve, reject) => {
      axios
        .post(
          `event/wish/${wishApplication.placeId}/${
            wishApplication.user.id
          }/reject`
        )
        .then((response) => {
          commit(NOTIFICATION_WISHES_REMOVE_ONE, wishApplication);
          resolve();
        })
        .catch((error) => {
          console.log(NOTIFICATION_WISH_REJECT, error);
          reject();
        });
    });
  },

  [NOTIFICATION_WISHES_FETCH]: ({ commit }) => {
    return new Promise((resolve, reject) => {
      axios
        .get('event/wishers')
        .then((response) => getResponseData<Wish[]>(response))
        .then((wishApplications) => {
          wishApplications.forEach(fixDates);
          commit(NOTIFICATION_WISHES_SET_ALL, wishApplications);
          resolve(wishApplications);
        })
        .catch((error) => {
          console.log(NOTIFICATION_WISHES_FETCH, error);
          reject();
        });
    });
  },

  [NOTIFICATIONS_FETCH]: ({ dispatch }) => {
    return new Promise((resolve, reject) => {
      Promise.all([
        dispatch(NOTIFICATION_INVITATIONS_FETCH),
        dispatch(NOTIFICATION_WISHES_FETCH)
      ])
        .then((results) => {
          const [invitations, wishes] = results;
          resolve({
            invitations,
            wishes
          });
        })
        .catch((error) => {
          console.log(NOTIFICATIONS_FETCH, error);
          reject(error);
        });
    });
  }
};
