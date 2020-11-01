import Vue from 'vue'
import Vuex from 'vuex'
import app from '@/feathers-client'
import router from '@/router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // these objects are the content of the application/objets metier/seuls ceux ci sont des diccionaires
    // le reste sont des arrais d'ids.
    boards: undefined,
    columns: undefined,
    tasks: undefined,
    users: undefined, //all the other user      localStorage.clear()

    OnLineUsers: undefined, // other users who are currently online
    activeUser: undefined, //current user, ici c'est just une id

    // Communication between components
    boardDrawer: false,
    userDrawer: true

    // pour chaque objet en state il y a une liste d'ids
    // boardsList: undefined,
    // columnsList: undefined,
    // tasksList: undefined,
    // usersList: undefined, ces listes sont des computed dasn les composants pertinents
    // Dans le computed on ne peux pas metre d'arguments
    // taskslist, elle n'a pas d'argument mais à l'interieur il y a une fonction qu'elle a des arguments
    // à la place d'un valeur elle renvoie une fonction avec des arguments
    // on l'appelle avec les arguments en parentheses
  },
  getters: {
    //si c'est juste pour l'utiliser une fois, il vaut mieux de le mettre en computed prop
    activeUserInfo() {
      // va chercher le user.id de activeUser chez users
    },
    columnsInBoard() {
      //TODO return => {{board.id:[columns.id ...]}, {board.id:[columns.id...]...}
    },
    tascksIncolumns() {
      //TODO return => {columns.id:[task.id ...], {columns.id:[task.id...]...}
    },
    usersOnOffLine() {
      //TODO return => [{online: [user.id...]},{offline: [user.id...]}]
    }
  },
  mutations: {
    // Nom des funtions VERVE{SET UPDATE DELETE}_OBJECT
    // Populate State (lecture)
    SET_BOARDS: (state, boardList) => {
      state.boards = {}
      boardList.forEach(board => {
        state.boards[board.id] = board
      })
    },
    SET_COLUMNS: (state, columnsList) => {
      state.columns = {}
      columnsList.forEach(columns => {
        state.columns[columns.id] = columns
      })
    },
    SET_TASKS: (state, tasksList) => {
      state.tasks = {}
      tasksList.forEach(task => {
        state.tasks[task.id] = task
      })
    },
    SET_OTHER_USERS: (state, userList) => {
      state.users = {}
      userList.forEach(user => {
        state.users[user.id] = user
      })
    },
    SET_ONLINE_USERS: (state, conUsers) => {
      state.OnLineUsers = undefined
      state.OnLineUsers = conUsers.authenticatedUsers.map(user => user.id)
    },
    SET_ACTIVE_USER: (state, user) => {
      state.activeUser = user
      router.replace({ name: 'user_id', params: {userName : state.activeUser.nickname} })
    },
    // Add new objects to state
    SET_NEW_BOARD: (state, board) => {
      //is equal to state.boards[board.id]=board
      Vue.set(state.boards, board.id, board)
    },
    SET_NEW_COLUMNS: (state, columns) => {
      Vue.set(state.columns, columns.id, columns)
    },
    SET_NEW_TASK: (state, task) => {
      Vue.set(state.tasks, task.id, task)
    },
    SET_NEW_USER: (state, user) => {
      Vue.set(state.users, user.id, user)
    },
    // Patch existing objects
    PATCH_BOARD: (state, board) => {
      state.boards[board.id] = board
    },
    // Delete existing objects
    REMOVE_BOARD: (state, boardId) => {
      Vue.delete(state.boards, state.boards[boardId])
    },
    // Other
    SET_BOARD_DRAWER: state => {
      state.boardDrawer = !state.boardDrawer
    },
    SET_USER_DRAWER: state => {
      state.userDrawer = !state.userDrawer
    },
    CLEAR_SESSION: state => {
      state.activeUser = undefined
    }
  },
  actions: {
    // Nom des variables : verve {fetch, create, delete, patch, etc} _object
    //                    or action {log_out}
    // Boards :

    async fetch_board_list({ commit }) {
      let boardList = await app.service('boards').find()
      commit('SET_BOARDS', boardList)
    },
    async create_board(_, payload) {
      let newBoard = await app.service('boards').create({
        ...payload
      })
      console.log('newBoard =', newBoard)
    },
    async post_board(_, board) {
      await app.service('boards').create(board)
    },
    async del_board(_, id) {
      await app.service('boards').remove(id)
    },
    async patch_board(_, payload) {
      await app.service('boards').patch(payload.id, payload.data)
    },
    // Columns :
    async fetch_column_list({ commit }) {
      const columnList = await app.service('columns').find()
      commit('SET_COLUMNS', columnList)
    },
    // USER :
    async log_in(_, payload) {
      try {
        if (!payload) {
          return await app.reAuthenticate()
        } else {
          return await app.authenticate({
            strategy: 'local',
            ...payload
          })
        }
      } catch (error) {
        router.push('LoggedOut')
      }
    },
    async log_out() {
      await app.logout()
    },
    async sign_up(_, payload) {
      await app.service('users').create({
        ...payload
      })
    },
    async fetch_user_list({ commit }) {
      let userList = await app.service('users').find()
      commit('SET_OTHER_USERS', userList)
    },
    async post_user(_, user) {
      await app.service('users').create(user)
    }
  },
  modules: {}
})
