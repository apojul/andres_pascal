<template>
  <v-app id="view">
    <span class="bg"></span
    ><v-container fluid pa-0>
      <v-row class="d-flex flex-nowrap py-3 overflow-auto">
        <v-col v-for="board in boardArray" :key="board.id" cols="2">
          <v-card class="ma-2" color="blue lighten-3">
            <v-card-title
              ><v-text-field
                :value="board.name"
                solo
                flat
                dense
                @input="patchBoard(board.id, 'name', $event)"
              ></v-text-field
            ></v-card-title>
            <v-card-subtitle
              class="text-wrap"
              @click.prevent.stop="goToBoard(board.id)"
              >{{ board['description']
              }}<v-icon color="primary" right
                >mdi-transfer-right</v-icon
              ></v-card-subtitle
            >
            <v-card-actions>
              <v-row
                ><v-col cols="3">
                  <DeleteButton :item-id="board.id" service="boards" /> </v-col
                ><v-spacer></v-spacer
                ><v-col cols="3"
                  ><PatchBoard
                    class="justify-start"
                    :board-id="board.id"
                    :dialog="patchBoardDisplay"
                    @click="showPatchBoard"/></v-col
              ></v-row>
            </v-card-actions>
          </v-card> </v-col
        ><v-col cols="2"
          ><v-btn
            small
            depressed
            color="grey lighten-3"
            class="text-lowercase ma-2"
            @click="addBoard"
            ><v-icon dark small>mdi-plus</v-icon>Create new board</v-btn
          ></v-col
        >
      </v-row></v-container
    ></v-app
  >
</template>

<script>
import DeleteButton from '@/components/DeleteButton'
import PatchBoard from '@/components/PatchBoard'
import { debounce } from 'debounce'
import app from '@/feathers-client'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    DeleteButton,
    PatchBoard
  },
  data() {
    return {
      patchBoardDisplay: false
    }
  },
  computed: {
    ...mapState(['activeUserId']),
    ...mapGetters({ boardArray: 'boardsOfUserArray' })
  },
  methods: {
    addBoard() {
      const newBoard = {
        name: 'New Board',
        description: '',
        user_id: this.activeUserId
      }
      console.log('userId', this.activeUserId)
      app.service('boards').create(newBoard)
    },
    deleteChange() {
      this.deleteTrue = false
    },
    goToBoard(id) {
      this.$router.push({ name: 'boardId', params: { id: id } })
    },
    patchBoard: debounce(function(id, key, value) {
      const data = {}
      data[key] = value
      app.service('boards').patch(id, data)
    }, 800),
    showPatchBoard() {
      this.patchBoardDisplay = !this.patchBoardDisplay
    }
  }
}
</script>

<style>
.bg {
  background: url('http://localhost:8080/img/natural-wonders-1400924-1600x1200.jpg')
    no-repeat center center fixed;
  background-size: cover;
}
</style>
