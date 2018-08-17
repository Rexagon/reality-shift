<!-- TEMPLATE BEGIN -->
<template>
  <div class="equipment-edit-page">
    <b-container class="content">
      <b-row>
        <b-col>
          <h3 class="page-title">Оборудование</h3>
        </b-col>
      </b-row>
      <br>

      <loading-stub-component v-if="loadingInProcess"></loading-stub-component>
      <div v-else>
        <b-row v-if="!isNewEquipment">
          <b-col v-bind:title="'Это временно'">
            ID:
            <span style="font-family: monospace">{{ equipment.id }}</span>
            <hr>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-form @submit.prevent="onSubmit">
              <b-form-group id="equipment-type-group" label="Тип оборудования">
                <equipment-type-selection-component v-model="equipmentTypeSelected"></equipment-type-selection-component>
              </b-form-group>

              <b-form-group id="serial-number-title-group" label="Серийный номер" label-for="title-input">
                <b-form-input id="serial-number-input" type="text" v-model.trim="equipment.serialNumber">
                </b-form-input>
              </b-form-group>

              <b-form-group id="description-group" label="Описание" label-for="description-input">
                <b-form-textarea id="description-input" :rows="3" :max-rows="6" v-model="equipment.description">
                </b-form-textarea>
              </b-form-group>

              <b-form-group id="owner-label-group" label="Владелец" label-for="owner-label" v-if="equipmentOwner && !isNewEquipment">
                <b>{{ equipmentOwner.email }}</b> {{ equipmentOwner.firstName }} {{ equipmentOwner.lastName }}
              </b-form-group>

              <br>

              <b-form-row class="buttons">
                <b-col cols="12" md="auto">
                  <b-button class="w-100 submit-button" type="submit" variant="primary" :disabled="isPageInProcess">Подтвердить</b-button>
                </b-col>
                <b-col cols="12" md="auto" v-if="!isNewEquipment">
                  <b-button class="w-100" variant="warning" :disabled="isPageInProcess" @click="showEquipmentOwnerModal">Изменить владельца</b-button>
                </b-col>
              </b-form-row>
            </b-form>
          </b-col>
        </b-row>
      </div>
      <br>
    </b-container>

    <b-modal v-model="equipmentOwnerModalShow" v-if="!isNewEquipment">
      <template slot="modal-title">
        Назначение владельца
      </template>

      <b-form-group id="owner-group" label="Владелец" label-for="owner-input">
        <user-selection-component v-model="equipmentOwnerModalData"></user-selection-component>
      </b-form-group>

      <template slot="modal-footer">
        <button type="button" class="btn btn-secondary" @click="equipmentOwnerModalShow = false">Отменить</button>
        <button type="button" class="btn btn-primary" :disabled="isModalInProcess" @click="onSubmitEquipmentOwner">Подтвердить</button>
      </template>
    </b-modal>
  </div>
</template>
<!-- TEMPALTE END -->


<!-- SCRIPT BEGIN -->
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { RouteConfig } from "vue-router";
import axios from "axios";

import LoadingStubComponent from "@/components/LoadingStubComponent.vue";
import UserSelectionComponent from "@/components/UserSelectionComponent.vue";
import EquipmentTypeSelectionComponent from "@/components/EquipmentTypeSelectionComponent.vue";

import {
  Equipment,
  EquipmentDefault,
  EquipmentType,
  EquipmentTypeDefault,
  EQUIPMENT_FETCH_ONE,
  EQUIPMENT_COMMIT
} from "@/store/modules/equipment";

import {
  User,
  UserDefault,
  USER_ASSIGN_EQUIPMENT,
  USER_REMOVE_EQUIPMENT
} from "@/store/modules/users";

enum State {
  Default,
  InProcess,
  Error
}

@Component({
  components: {
    "loading-stub-component": LoadingStubComponent,
    "user-selection-component": UserSelectionComponent,
    "equipment-type-selection-component": EquipmentTypeSelectionComponent
  }
})
export default class EquipmentEditPage extends Vue {
  // Page properties //
  ////////////////////

  pageState: State = State.Default;
  isNewEquipment: boolean = false;
  loadingInProcess: boolean = false;

  // Equipment properties //
  /////////////////////////

  equipment: Equipment = new EquipmentDefault();
  equipmentTypeSelected: EquipmentType = new EquipmentTypeDefault();
  equipmentOwner: User | null = null;

  equipmentOwnerModalShow: boolean = false;
  equipmentOwnerModalData: User | null = null;
  equipmentOwnerModalState: State = State.Default;

  mounted() {
    this.loadingInProcess = true;

    const equipmentId = this.$route.params.id;
    if (equipmentId && equipmentId != "new") {
      this.$store.dispatch(EQUIPMENT_FETCH_ONE, equipmentId).then(equipment => {
        this.setEquipment(equipment);

        this.loadingInProcess = false;
      });
    } else {
      this.isNewEquipment = true;
      this.loadingInProcess = false;
    }
  }

  // Equipment methods //
  //////////////////////

  onSubmit() {
    if (this.equipmentTypeSelected) {
      this.pageState = State.InProcess;
      this.equipment.equipmentTypeId = this.equipmentTypeSelected.id;

      this.$store
        .dispatch(EQUIPMENT_COMMIT, this.equipment)
        .then(equipment => {
          this.setEquipment(equipment);

          this.pageState = State.Default;
          if (this.isNewEquipment) {
            this.isNewEquipment = false;
            this.$router.push({ path: "/equipment/" + equipment.id });
          } else {
            this.$notify({
              title: "Изменения успешно сохранены",
              duration: 500
            });
          }
        })
        .catch(error => {
          this.pageState = State.Error;
        });
    }
  }

  setEquipment(equipment: Equipment) {
    this.equipment = equipment;
    this.equipmentTypeSelected = equipment.equipmentType
      ? equipment.equipmentType
      : new EquipmentTypeDefault();

    if (equipment.ownerId) {
      axios.get("user/" + equipment.ownerId).then(result => {
        const body = result && result.data;
        this.equipmentOwner = body.data;
        this.equipmentOwnerModalData = body.data;
      });
    }
  }

  get isPageInProcess(): boolean {
    return this.pageState == State.InProcess;
  }

  // Modal window methods //
  /////////////////////////

  onSubmitEquipmentOwner() {
    this.equipmentOwnerModalState = State.InProcess;

    const onSuccess = () => {
      this.equipment.ownerId = this.equipmentOwnerModalData
        ? this.equipmentOwnerModalData.id
        : undefined;
      this.equipmentOwner = this.equipmentOwnerModalData;

      this.equipmentOwnerModalState = State.Default;
      this.equipmentOwnerModalShow = false;

      this.$notify({
        title: "Владелец успешно изменён",
        duration: 500
      });
    };

    const assignEquipment = () => {
      return this.$store
        .dispatch(USER_ASSIGN_EQUIPMENT, {
          equipment: this.equipment,
          owner: this.equipmentOwnerModalData
        })
        .then((equipment: Equipment) => {
          onSuccess();
        })
        .catch(err => {
          console.log(err);
          this.equipmentOwnerModalState = State.Error;
        });
    };

    if (this.equipment.ownerId) {
      this.$store
        .dispatch(USER_REMOVE_EQUIPMENT, {
          equipment: this.equipment,
          owner: this.equipment.ownerId
        })
        .then((equipment: Equipment) => {
          if (this.equipmentOwnerModalData) {
            assignEquipment();
          } else {
            onSuccess();
          }
        })
        .catch(err => {
          console.log(err);
          this.equipmentOwnerModalState = State.Error;
        });
    } else if (this.equipmentOwnerModalData) {
      assignEquipment();
    } else {
      onSuccess();
    }
  }

  showEquipmentOwnerModal() {
    this.equipmentOwnerModalShow = true;
  }

  get isModalInProcess(): boolean {
    return this.equipmentOwnerModalState == State.InProcess;
  }
}

export const equipmentEditPageRoute = <RouteConfig>{
  path: "/equipment/:id",
  name: "EquipmentEditPage",
  component: EquipmentEditPage
};
</script>
<!-- SCRIPT END -->


<!-- STYLES BEGIN -->
<style lang="scss">
@import "@/styles/general.scss";

.equipment-edit-page {
  @include media-breakpoint-down(sm) {
    .buttons > div {
      margin-bottom: 0.5rem;
    }

    .buttons > div:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
<!-- STYLES END -->