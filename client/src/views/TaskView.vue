<template
  ><div>
    <v-card
      v-for="(task, index) in taskArray(columnId)"
      :key="index"
      class="task d-flex ma-4"
      draggable
      @dragstart.self="pickTask($event, index, taskArray(columnId))"
      @dragover.stop.prevent="overTask($event)"
      @dragleave.stop.prevent="leaveTask($event)"
      @drop.prevent.stop="
        dropTask($event, taskArray(columnId), index, columnId)
      "
      ><v-text-field
        :value="task.title"
        solo
        flat
        dense
        align="center"
        @input="patchTask(task.id, 'title', $event)"
      >
      </v-text-field>
      <v-card-actions
        ><!-- <v-row
            ><v-col cols="3"
              ><PatchTask
                class="justify-start"
                :task-id="task.id"
                :dialog="patchTaskDisplay"
                @click="showPatchTask"/></v-col
            ><v-spacer></v-spacer
            ><v-col cols="3">
              <DeleteButton :item-id="task.id" service="tasks"/></v-col
          ></v-row> -->
      </v-card-actions>
    </v-card>
    <v-card
      v-show="taskArray(columnId).length === 0"
      @dragover.stop.prevent
      @drop.prevent.stop="dropEmptyTask($event, columnId)"
    >
      <AddTask :column-id="columnId" :displayed-tasks="taskArray">
        Add or drop task
      </AddTask>
    </v-card>
    <v-card v-show="taskArray(columnId).length != 0"
      ><AddTask :column-id="columnId" :displayed-tasks="taskArray" />
    </v-card>
  </div>
</template>

<script>
import { debounce } from 'debounce'
import app from '@/feathers-client'
/* import PatchTask from '@/components/PatchTask'
import DeleteButton from '@/components/DeleteButton' */
import { mapGetters } from 'vuex'
import AddTask from '@/components/AddTask'

export default {
  name: 'Task',
  components: {
    /* PatchTask,
    DeleteButton */
    AddTask
  },
  props: {
    columnId: {
      type: Number,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      patchTaskDisplay: false
    }
  },
  computed: {
    ...mapGetters(['columnsInBoardArray', 'tasksInColumnArray']),
    taskArray() {
      return id => {
        if (this.tasksInColumnArray(id).length === 0) {
          return []
        }
        return this.tasksInColumnArray(id)
      }
    }
  },
  methods: {
    dropEmptyTask(event, toColumnId) {
      let type = event.dataTransfer.getData('type')
      if (type != 'task') {
        return
      }
      const fromTaskIndex = parseInt(
        event.dataTransfer.getData('from-task-index')
      )
      const dragTaskList = JSON.parse(
        event.dataTransfer.getData('from-task-list')
      )
      const fromTask = dragTaskList[fromTaskIndex]
      const dropTaskList = this.taskArray(toColumnId)
      dragTaskList.splice(fromTaskIndex, 1)[0]
      fromTask.column_id = toColumnId
      dropTaskList.push(fromTask)
      app.service('tasks').patch(fromTask.id, {
        rank: 0,
        column_id: toColumnId
      })
    },
    pickTask(event, dragTaskIndex, dragTaskList) {
      // effects
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.dropEffect = 'move'
      // recover data from event
      event.dataTransfer.setData('type', 'task')
      event.dataTransfer.setData('from-task-index', dragTaskIndex)
      event.dataTransfer.setData('from-task-list', JSON.stringify(dragTaskList))
    },
    dropTask(event, toTaskList, toTaskIndex, toColumnId) {
      let type = event.dataTransfer.getData('type')
      event.currentTarget.style.opacity = ''
      if (type != 'task') {
        return
      }
      const fromTaskIndex = parseInt(
        event.dataTransfer.getData('from-task-index')
      )
      const fromTaskList = JSON.parse(
        event.dataTransfer.getData('from-task-list')
      )
      const fromTask = fromTaskList[fromTaskIndex]
      // splice fromTask in place of toTask
      let spliceTask = (fromList, fromIndex, toIndex, toList) => {
        let list = toList === undefined ? fromList : toList
        list.splice(toTaskIndex++, 0, fromTaskList.splice(fromTaskIndex, 1)[0])
      }
      if (fromTask.column_id === toColumnId) {
        fromTask.column_id = toColumnId
        // move item in tasks list
        spliceTask(fromTaskList, fromTaskIndex, toTaskIndex)
      } else {
        // move item in tasks list
        let toIndex =
          toTaskIndex === toTaskList.length - 1
            ? (toTaskIndex = toTaskList.length)
            : toTaskIndex
        spliceTask(fromTaskList, fromTaskIndex, toIndex, toTaskList)

        for (let i = 0; i < toTaskList.length; i++) {
          app.service('tasks').patch(toTaskList[i].id, {
            rank: i
          })
        }
        // change column_id in task to match toColumn
        app.service('tasks').patch(fromTask.id, { column_id: toColumnId })
      }
      // save new indexes and new column_id if need
      for (let i = 0; i < fromTaskList.length; i++) {
        app.service('tasks').patch(fromTaskList[i].id, { rank: i })
      }
    },
    patchTask: debounce(function(id, key, value) {
      const data = {}
      data[key] = value
      app.service('tasks').patch({ id: id }, data)
    }, 800),
    showPatchTask() {
      this.patchTaskDisplay = !this.patchTaskDisplay
    },

    enterTask(event) {
      event.currentTarget.style.opacity = '0.3'
    },
    leaveTask(event) {
      event.currentTarget.style.opacity = '1'
    },
    overTask(event) {
      event.currentTarget.style.opacity = '0.3'
    }
  }
}
</script>
<style>
.task {
  border: 5px solid black;
}
</style>
