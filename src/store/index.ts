import Vue from "vue"
import Vuex, { StoreOptions } from "vuex"
import { RootState } from "./types"

import { authorization } from "./modules/authorization"
import { profile } from "./modules/profile"
import { events } from "./modules/events"

import { SYSTEM_NAME } from "./actions/global"

Vue.use(Vuex)

const state: RootState = {
  systemName: "ITlab"
}

const store: StoreOptions<RootState> = {
  modules: {
    authorization,
    profile,
    events
  },
  state,
  
  getters: {
    [SYSTEM_NAME]: (state) => {
      return state.systemName
    }
  }
}

export default new Vuex.Store<RootState>(store)