<template>
  <div>
    <md-table-row style="cursor:pointer"
                  class="delegate-row"
                  :class="{upvoted, downvoted, active: showDetails}"
                  @click.native="toggleDetails">
      <md-table-cell>
        <md-checkbox v-model="voted" title="vote" @change="onCheckboxChange"></md-checkbox>
      </md-table-cell>
      <md-table-cell style="text-align: left">{{ delegate.rank }}</md-table-cell>
      <md-table-cell style="text-align: left"><span>{{ delegate.username }}</span></md-table-cell>
      <md-table-cell>
        <md-icon>{{ showDetails ? 'keyboard_arrow_down' : 'chevron_right' }}</md-icon>
      </md-table-cell>
    </md-table-row>
    <md-table-row v-show="showDetails"
                  style="border-top-width: 0; padding-bottom: 10px"
                  class="delegate-row"
                  :class="{upvoted, downvoted, active: showDetails}">
      <md-table-cell collspan="4" class="delegate-details">
        <md-layout md-column>
          <md-layout md-gutter md-column-xsmall>
            <md-layout class="delegate-info-box">
              <span class="status-indicator" :style="delegate.style" :title="delegate.tooltip"></span>
              <a target="_blank" :href="'https://explorer.adamant.im/delegate/' + delegate.address">
                {{ delegate.address }}
              </a>
            </md-layout>
            <md-layout md-hide-xsmall></md-layout>
          </md-layout>
          <md-layout md-gutter md-column-xsmall>
            <md-layout class="delegate-info-box">
              {{ $t('votes.delegate_uptime') }}:&nbsp;
              <strong>{{ delegate.productivity }}%</strong>
            </md-layout>
            <md-layout class="delegate-info-box">
              {{ $t('votes.delegate_approval') }}:&nbsp;
              <strong>{{ delegate.approval }}%</strong>
            </md-layout>
          </md-layout>
          <md-layout md-gutter md-column-xsmall>
            <md-layout class="delegate-info-box">
              {{ $t('votes.delegate_forging_time') }}:&nbsp;
              <strong>{{ formatForgingTime(delegate.forgingTime) }}</strong>
            </md-layout>
            <md-layout class="delegate-info-box">
              {{ $t('votes.delegate_forged') }}:&nbsp;
              <strong>{{ (delegate.forged / 100000000).toFixed(4) }}ADM</strong>
            </md-layout>
          </md-layout>
          <md-layout md-gutter md-column-xsmall>
            <md-layout class="delegate-info-box">
              {{ $t('votes.delegate_link') }}:&nbsp;
              <strong>{{ delegate.link }}</strong>
            </md-layout>
            <md-layout class="delegate-info-box">
              {{ $t('votes.delegate_description') }}:&nbsp;
              <strong>{{ delegate.description }}</strong>
            </md-layout>
          </md-layout>
        </md-layout>
      </md-table-cell>
    </md-table-row>
  </div>
</template>

<script>
export default {
  name: 'vote-entry',
  props: {
    index: {
      type: Number,
      required: true
    },
    delegate: {
      type: Object,
      required: true
    },
    'down-voted': {
      type: Boolean,
      required: false,
      default: false
    },
    'up-voted': {
      type: Boolean,
      required: false,
      default: false
    },
    available: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      voted: this.upVoted || (this.delegate.voted && !this.downVoted),
      downvoted: this.downVoted,
      upvoted: this.upVoted,
      showDetails: false
    }
  },
  methods: {
    onCheckboxChange () {
      if (this.voted) {
        if (this.delegate.voted) {
          if (!this.available) {
            return false
          }
          this.downvoted = true
        }
        this.upvoted = false

        this.$emit('change', this.delegate.voted, false)
      } else {
        if (!this.delegate.voted) {
          if (!this.available) {
            return false
          }
          this.upvoted = true
        }
        this.downvoted = false

        this.$emit('change', false, !this.delegate.voted)
      }

      this.voted = !this.voted
    },
    toggleDetails () {
      if (!this.showDetails) {
        this.$store.dispatch('delegates/getForgedByAccount', this.delegate)
        this.$store.dispatch('delegates/getForgingTimeForDelegate', this.delegate)
      }
      this.showDetails = !this.showDetails
    },
    formatForgingTime (seconds) {
      if (!seconds) {
        return '...'
      }
      if (seconds === 0) {
        return 'Now!'
      }
      const minutes = Math.floor(seconds / 60)
      seconds = seconds - (minutes * 60)
      if (minutes && seconds) {
        return `${minutes} min ${seconds} sec`
      } else if (minutes) {
        return `${minutes} min `
      } else {
        return `${seconds} sec`
      }
    }
  }
}
</script>

<style scoped>

</style>
