<!-- TEMPLATE BEGIN -->
<template>
  <div class="notifications-page">
    <vue-headful title="Уведомления"></vue-headful>
    <page-content :loading="loadingInProcess">
      <template slot="header">
        Уведомления
      </template>

      <template v-if="notifications.length > 0">
        <b-row v-for="(handle, notificationIndex) in notifications" :key="`${handle.type}-${notificationIndex}-${handle.notification.placeId}`">
          <b-col>
            <invitation-notification :data="handle.notification" v-if="handle.type === 'invitation'"></invitation-notification>
            <wish-notification :data="handle.notification" v-if="handle.type === 'wish'"></wish-notification>
          </b-col>
        </b-row>
      </template>
      <template v-else>
        <b-row>
          <b-col class="text-center text-lg-left">
            <span class="notifications-empty-text">Новых уведомлений нет</span>
          </b-col>
        </b-row>
      </template>
    </page-content>
  </div>
</template>
<!-- TEMPALTE END -->


<!-- SCRIPT BEGIN -->
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { RouteConfig } from 'vue-router';
import moment from 'moment-timezone';

import CPageContent from '@/components/layout/PageContent.vue';
import CWishNotification from '@/components/notifications/WishNotification.vue';
import CInvitationNotification from '@/components/notifications/InvitationNotification.vue';

import {
  IWishNotification,
  IInvitationNotification,
  NOTIFICATION_INVITATIONS_GET_ALL,
  NOTIFICATION_WISHES_GET_ALL,
  NOTIFICATIONS_FETCH
} from '@/modules/notifications';

interface NotificationHandle {
  type: 'invitation' | 'wish';
  notification: IInvitationNotification | IWishNotification;
}

@Component({
  components: {
    'page-content': CPageContent,
    'wish-notification': CWishNotification,
    'invitation-notification': CInvitationNotification
  }
})
export default class NotificationsPage extends Vue {
  // Properties //
  ///////////////

  public loadingInProcess: boolean = true;

  // Component methods //
  //////////////////////

  public mounted() {
    this.loadingInProcess = this.eventInvitations.length === 0;

    this.$store
      .dispatch(NOTIFICATIONS_FETCH)
      .then((results) => {
        this.loadingInProcess = false;
      })
      .catch(() => {
        this.loadingInProcess = false;
      });
  }

  // Computed data //
  //////////////////

  get notifications(): NotificationHandle[] {
    let result: NotificationHandle[] = this.eventInvitations.map(
      (invitation) => {
        return {
          type: 'invitation',
          notification: invitation
        } as NotificationHandle;
      }
    );

    result = result.concat(
      this.eventWishes.map((wish) => {
        return {
          type: 'wish',
          notification: wish
        } as NotificationHandle;
      })
    );

    result.sort((a, b) => {
      const timeFirst = a.notification.creationTime;
      const timeSecond = b.notification.creationTime;

      if (timeFirst < timeSecond) {
        return 1;
      } else if (timeFirst > timeSecond) {
        return -1;
      } else {
        return 0;
      }
    });

    return result;
  }

  get eventInvitations(): IInvitationNotification[] {
    return this.$store.getters[NOTIFICATION_INVITATIONS_GET_ALL];
  }

  get eventWishes(): IWishNotification[] {
    return this.$store.getters[NOTIFICATION_WISHES_GET_ALL];
  }
}

export const notificationsPageRoute: RouteConfig = {
  path: '/notifications',
  name: 'NotificationsPage',
  component: NotificationsPage
};
</script>
<!-- SCRIPT END -->


<!-- STYLE BEGIN -->
<style lang="scss">
@import '@/styles/general.scss';

.notifications-page {
  .notifications-empty-text {
    font-size: 2em;
  }
}
</style>
<!-- STYLE END -->
