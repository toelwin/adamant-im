<template>
  <v-card flat :class="className">
      <v-layout>
          <v-flex hidden-xs-and-down sm3 md2 lg2 hideonsmall>
              <icon :width="100" :height="100" fill="#BDBDBD" slot="icon2" class="centerIcon">
                  <component :is="cryptoIcon"/>
              </icon>
          </v-flex>
          <v-flex sm12 md10 lg10>
              <v-list two-line :class="`${className}__list`">
      <v-list-tile @click="copyToClipboard(address)">
        <v-list-tile-content>
          <v-list-tile-title :class="`${className}__title`">
            {{ cryptoName }} {{ $t('home.wallet') }}
          </v-list-tile-title>
          <v-list-tile-sub-title :class="`${className}__subtitle`">
            {{ address }}
          </v-list-tile-sub-title>
        </v-list-tile-content>

        <v-list-tile-action>
          <v-btn icon ripple>
            <v-icon :class="`${className}__action`">mdi-content-copy</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile @click="$emit('click:balance', crypto)">
        <v-list-tile-content>
          <v-list-tile-title :class="`${className}__title`">
            {{ $t('home.balance') }}
          </v-list-tile-title>
          <v-list-tile-sub-title :class="`${className}__subtitle`">
            {{ balance | currency(crypto, true) }}
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
          </v-flex>
      </v-layout>
    <v-divider></v-divider>

    <WalletCardListActions
      :class="`${className}__list`"
      :crypto="crypto"
    />
  </v-card>

</template>

<script>
import { copyToClipboard } from '@/lib/textHelpers'
import WalletCardListActions from '@/components/WalletCardListActions'
import Icon from '@/components/icons/BaseIcon'
import AdmFillIcon from '@/components/icons/AdmFill'
import BnbFillIcon from '@/components/icons/BnbFill'
import EthFillIcon from '@/components/icons/EthFill'
import BnzFillIcon from '@/components/icons/BnzFill'
import DogeFillIcon from '@/components/icons/DogeFill'

export default {
  computed: {
    className () {
      return 'wallet-card'
    }
  },
  methods: {
    copyToClipboard (text) {
      copyToClipboard(text)

      this.$store.dispatch('snackbar/show', {
        message: this.$t('home.copied')
      })
    }
  },
  components: {
    WalletCardListActions,
    Icon,
    AdmFillIcon,
    BnbFillIcon,
    EthFillIcon,
    BnzFillIcon,
    DogeFillIcon
  },
  props: {
    address: {
      type: String,
      required: true
    },
    balance: {
      type: Number,
      required: true
    },
    crypto: {
      type: String,
      default: 'ADM'
    },
    cryptoName: {
      type: String,
      default: 'ADAMANT'
    },
    cryptoIcon: {
      type: String,
      default: 'adm-fill-icon'
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~vuetify/src/stylus/settings/_colors.styl'

@media screen and (max-width: 599px)
    .hideonsmall
      display: none
.centerIcon
    vertical-align: middle
    text-align: center
    display: block
    height: 100%
    width: 100%
    display: flex
    align-items: center
.wallet-card
  &__title
    font-size: 16px
    font-weight: 500
  &__subtitle
    font-size: 14px
    font-weight: 400
    word-break: break-word
    font-style: italic

/** Themes **/
.theme--light
  .wallet-card
    background-color: transparent

    &__list
      background: inherit
    &__title
      color: $grey.darken-3
    &__subtitle
      color: $grey.darken-2
.theme--dark
  .wallet-card
    background-color: transparent

    &__list
      background: inherit
    &__title
      color: $shades.white
    &__subtitle
      color: $shades.white
</style>
