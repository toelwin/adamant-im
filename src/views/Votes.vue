<template>
  <div class="votes">
    <md-layout class='chat_loads' v-show="!delegatesLoaded">
      <md-spinner :md-size="150" :md-stroke="1" md-indeterminate class="md-accent" style="margin: 0px -75px;position: fixed;left: 50%;"></md-spinner>
    </md-layout>
    <div class="white-color-table" style="max-width:95%; margin:auto;" v-show="delegatesLoaded">
      <md-table-card class='votes-card' style="box-shadow:none">
        <md-toolbar class="custom-votes-toolbar">
          <md-layout class="white-color-search-bar">
            <md-layout md-flex="100">
              <md-input-container>
                <md-button class="md-icon-button">
                  <md-icon>search</md-icon>
                </md-button>
                <md-input style="width:100%" v-model="filterString" :placeholder="$t('votes.filter_placeholder')"></md-input>
              </md-input-container>
            </md-layout>
          </md-layout>
        </md-toolbar>
          <md-table md-sort="rank" md-sort-type="desc" @sort="onSort" :style="tableStyle">
            <md-table-header>
              <md-table-row>
                <md-table-head>{{$t('votes.table_head_vote')}}</md-table-head>
                <md-table-head md-sort-by="rank">{{$t('votes.table_head_rank')}}</md-table-head>
                <md-table-head md-sort-by="username">{{$t('votes.table_head_name')}}</md-table-head>
                <md-table-head></md-table-head>
              </md-table-row>
            </md-table-header>
            <md-table-body>
              <VoteEntry v-for="(delegate, index) in delegates"
                         v-show="filteredDelegates[delegate.address] || typeof filteredDelegates[delegate.address] === 'undefined'"
                         :key="index + delegate.address"
                         :index="index"
                         :delegate="delegate"
                         :up-voted="typeof upvotedDelegates[delegate.address] !== 'undefined'"
                         :down-voted="typeof downvotedDelegates[delegate.address] !== 'undefined'"
                         :available="upVotesCount + downVotesCount < 30"
                         @change="(downvoted, upvoted) => { vote(delegate, downvoted, upvoted) }">
              </VoteEntry>
            </md-table-body>
          </md-table>
      </md-table-card>
      <md-card>
          <md-card-header>
            <div class="md-title">{{ $t('votes.summary_title') }}</div>
            <div class="md-subhead">
              {{$t('votes.upvotes')}}: <strong>{{ upVotesCount }}</strong>,&nbsp;
              {{$t('votes.downvotes')}}: <strong>{{ downVotesCount }}</strong>,&nbsp;
              {{$t('votes.total_new_votes')}}: <strong>{{ downVotesCount + upVotesCount }}</strong> / {{ voteRequestLimit }},&nbsp;
              {{$t('votes.total_votes')}}: <strong>{{ originVotesCount }} / {{ delegatesCount }}</strong>
            </div>
          </md-card-header>
          <md-card-expand>
            <md-card-actions>
              <md-button :disabled="upVotesCount + downVotesCount === 0" @click="sendVotes">{{$t('votes.vote_button_text')}}</md-button>
              <span style="flex: 1"></span>
              <md-button class="md-icon-button" md-expand-trigger>
                <md-icon>keyboard_arrow_down</md-icon>
              </md-button>
            </md-card-actions>
            <md-card-content style="text-align: left">
              {{$t('votes.summary_info')}} <a href="https://adamant.im" target="_blank">{{$t('votes.summary_info_link_text')}}</a>
            </md-card-content>
          </md-card-expand>
      </md-card>
    </div>
    <md-snackbar md-position="bottom center" md-accent ref="votesSnackbar" md-duration="5000">
      <span>{{ votesErrorMsg}}</span>
    </md-snackbar>
  </div>
</template>

<script>
import VoteEntry from '@/components/VoteEntry'

export default {
  name: 'votes',
  components: {
    VoteEntry
  },
  data () {
    return {
      voteRequestLimit: 30,
      sortParams: {
        name: 'rank',
        type: 'desc'
      },
      status: [
        { style: { 'background-color': 'green', 'border-color': 'green' }, tooltip: 'Forging' },
        { style: { 'background-color': 'orange', 'border-color': 'orange' }, tooltip: 'Missed block' },
        { style: { 'background-color': 'red', 'border-color': 'red' }, tooltip: 'Not forging' },
        { style: { 'border-color': 'green' }, tooltip: 'Awaiting slot' },
        { style: { 'border-color': 'orange' }, tooltip: 'Awaiting slot' },
        { style: { 'border-color': 'gray' }, tooltip: 'Awaiting status' }
      ],
      tableStyle: {
        height: this.formatHeight(window.innerHeight)
      },
      votesErrorMsg: '',
      filterString: '',
      downvotedDelegates: {},
      upvotedDelegates: {},
      filteredDelegates: {}
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        this.tableStyle.height = this.formatHeight(window.innerHeight)
      })
    })
    this.$store.dispatch('delegates/getDelegates', { address: this.$store.state.address })
  },
  methods: {
    vote (delegate, downvoted, upvoted) {
      if (this.downVotesCount + this.upVotesCount >= this.voteRequestLimit) {
        return false
      }

      if (downvoted && !upvoted) {
        this.$set(this.downvotedDelegates, delegate.address, delegate)
      } else if (!downvoted && upvoted) {
        this.$set(this.upvotedDelegates, delegate.address, delegate)
      } else {
        this.$delete(this.downvotedDelegates, delegate.address)
        this.$delete(this.upvotedDelegates, delegate.address)
      }
    },
    onSort (params) {
      this.sortParams = params
    },
    sendVotes () {
      if (this.$store.state.balance < 50) {
        this.votesErrorMsg = this.$t('votes.no_money')
      } else {
        let votes = Object.values(this.downvotedDelegates).map(x => `-${x.publicKey}`).concat(Object.values(this.upvotedDelegates).map(x => `+${x.publicKey}`))
        this.$store.dispatch('delegates/voteForDelegates', { votes: votes, address: this.$store.state.address })
      }
    },
    statusStyle (delegate) {
      return this.status[delegate.status || 5].style
    },
    statusTooltip (delegate) {
      return this.status[delegate.status || 5].tooltip
    },
    formatHeight (height) {
      return `${height * 0.60}px !important`
    }
  },
  watch: {
    errorMsg (value) {
      this.votesErrorMsg = value
      this.$refs.votesSnackbar.open()
      window.setTimeout(() => this.$store.commit('send_error', { msg: '' }), 5000) // cleanup error msg
    },
    votesErrorMsg (value) {
      this.$refs.votesSnackbar.open()
    },
    filterString (value) {
      for (let delegate of this.delegates) {
        this.filteredDelegates[delegate.address] = delegate.address.includes(value) || delegate.username.includes(value)
      }
    }
  },
  computed: {
    delegates () {
      const compare = (a, b) => {
        const compareNumbers = (x, y) => this.sortParams.type === 'desc' ? x - y : y - x
        const compareString = (x, y) => {
          x = x.toUpperCase()
          y = y.toUpperCase()
          if (x < y) {
            return this.sortParams.type === 'desc' ? -1 : 1
          }
          if (x > y) {
            return this.sortParams.type === 'desc' ? 1 : -1
          }
          return 0
        }
        const lVal = a[this.sortParams.name]
        const rVal = b[this.sortParams.name]
        if (typeof lVal === 'string' && typeof rVal === 'string') {
          // check for ADAMANT ID field
          let [x, ...xs] = lVal
          if (x === 'U') {
            let [, ...ys] = rVal
            return compareNumbers(parseInt(xs.join('')), parseInt(ys.join('')))
          } else {
            return compareString(lVal, rVal)
          }
        }
        if (typeof lVal === 'number' && typeof rVal === 'number') {
          return compareNumbers(lVal, rVal)
        }
        console.log('uncompared values!', a, b)
        return 0
      }

      return Object.values(this.$store.state.delegates.delegates)
        .sort(compare)
        .map((x) => {
          x.style = this.statusStyle(x)
          x.tooltip = this.statusTooltip(x)
          return x
        })
    },
    delegatesCount () {
      return Object.keys(this.$store.state.delegates.delegates).length
    },
    originVotesCount () {
      return Object.keys(this.$store.state.delegates.delegates).filter(x => x.voted).length
    },
    downVotesCount () {
      return Object.keys(this.downvotedDelegates).length
    },
    upVotesCount () {
      return Object.keys(this.upvotedDelegates).length
    },
    totalVotes () {
      return this.upVotesCount + this.originVotesCount - this.downVotesCount
    },
    delegatesLoaded () {
      if (this.$store.state.delegates.delegates) {
        return Object.keys(this.$store.state.delegates.delegates).length > 0
      }
    },
    errorMsg () {
      return this.$store.state.lastErrorMsg
    }
  }
}
</script>

<style lang="scss">
  .votes {
    position: relative;
    .md-checkbox {
      .md-checkbox-container {
        &:after {
          border: 2px solid gray;
          border-top: 0;
          border-left: 0;
        }
      }
      margin-top: 0;
    }
    .md-table {
      display: block;
      overflow: hidden;
      table {
        width: 100%;
        display: block;
        height: 100%;
      }
      thead {
        width: 100%;
        display: block;
        overflow: auto;
      }
      tbody {
        width: 100%;
        display: block;
        overflow: auto;
        height: calc(100% - 66px);
        overflow-x: hidden;
      }
      tr {
        width: 100%;
        display: block;
        &:hover {
          background-color: #eee;
        }
      }
      .md-table-row {
        &:hover {
          .md-table-cell {
            background-color: transparent !important;
          }
        }
      }
      td {
        width: 24%;
        display: inline-block;
        padding: 10px;
      }
      th {
        width: 24%;
        display: inline-block;
        padding: 10px;
      }
    }
    .md-table-head {
      padding-bottom: 0 !important;
    }
    .md-toolbar.md-theme-grey {
      border-bottom: none;
      padding-top: 25px;
    }
    .delegate-details {
      width: 100% !important;
      height: auto !important;
      ul {
        list-style: none;
      }
    }
    .md-card {
      margin-top: 20px;
      padding-bottom: 10px;
    }
    .md-card-header {
      text-align: left;
    }
  }
  .md-table-row.delegate-row.active {
    background-color: #eee;
  }
  .md-table-row.delegate-row.downvoted {
    background-color: antiquewhite;
    &:hover {
      background-color: antiquewhite;
    }
  }
  .md-table-row.delegate-row.upvoted {
    background-color: azure;
    &:hover {
      background-color: azure;
    }
  }
  .table-summary {
    span {
      padding: 5px;
      margin-top: 20px;
    }
  }
  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 10px;
    border: 2px solid gray;
    display: inline-block;
    margin: 5px 5px 0 0;
  }
  .chat_loads {
    position: absolute;
    background: rgba(0,0,0,0.3);
    height: 100%;
    width: 100%;
    min-height: 100vh;
    left: 0;
    padding-top: 15%;
    z-index: 10;
    top: -25px;
  }
  .md-spinner.md-accent {
    .md-spinner-path {
      stroke: #4A4A4A;
    }
  }
  .md-table-cell.delegate-details {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    margin-left: 5px;
    .md-table-cell-container {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      margin-left: 5px;
    }
  }
  .md-table-cell {
    ul {
      margin-top: 0;
      margin-bottom: 0;
    }
  }
  .white-color-table {
    background-color: #FFF;
  }
  .white-color-search-bar {
    background-color: #FFF;
    padding: 35px 0 0 0;
    margin-top: -25px;
    margin-left: 0px;
    margin-right: 0px;
  }
  .custom-votes-toolbar {
    background: repeating-linear-gradient(140deg,#f6f6f6,#f6f6f6 1px,#fefefe 0,#fefefe 5px) !important;
    margin-left: 0px !important;
    margin-right: 0px !important;
    padding-right: 0px !important;
    padding-left: 0px !important;
    position: relative !important;
  }
  @media (max-width: 600px) {
    .votes {
      .md-column-xsmall {
        .delegate-info-box {
          padding: 0 3px 10px 0;
        }
      }
    }
  }
</style>
