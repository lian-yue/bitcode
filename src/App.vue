<script setup lang="ts">
import { reactive, watch } from 'vue'
import hash from 'hash.js';
import basex from 'base-x';

const bs62 = basex('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
const bs52 = basex('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
const bs10 = basex('0123456789')

const data = reactive({
  step: 1,
  salt: window.localStorage.getItem("salt") || "",
  prefixShort: window.localStorage.getItem("prefix-short") || "",
  suffixShort: window.localStorage.getItem("suffix-short") || "",
  prefixLong: window.localStorage.getItem("prefix-long") || "",
  suffixLong: window.localStorage.getItem("suffix-long") || "",
  text:"",
  encodeNumber:"",
  encodeShort:"",
  encodeLong:"",
  copied: false,
})
if (data.salt !== "") {
  data.step = 2
}
watch(
  () => data.salt,
  (salt) => {
    window.localStorage.setItem("salt", salt)
})
watch(
  () => data.prefixShort,
  (prefixShort) => {
    window.localStorage.setItem("prefix-short", prefixShort)
})
watch(
  () => data.suffixShort,
  (suffixShort) => {
    window.localStorage.setItem("suffix-short", suffixShort)
})
watch(
  () => data.prefixLong,
  (prefixLong) => {
    window.localStorage.setItem("prefix-long", prefixLong)
})
watch(
  () => data.suffixLong,
  (suffixLong) => {
    window.localStorage.setItem("suffix-long", suffixLong)
})


let textTimeoutId: any = null
function textSetTimeout(text: string) {
  if (textTimeoutId) {
    clearTimeout(textTimeoutId)
    textTimeoutId = null
  }

  if (text) {
    textTimeoutId = setTimeout(function () {
      data.text = ""
    }, 60000)
  }
}

watch(
  () => data.text,
  (text) => {
    textSetTimeout(text)
    if (text) {
      const hashDigest = hash.sha256().update(data.salt + hash.sha256().update(data.text.toLowerCase()).digest("hex"));
      let b10 = bs10.encode(hashDigest.digest())
      let b49 = bs52.encode(hashDigest.digest())
      let b58 = bs62.encode(hashDigest.digest())
      let bstr = b49.substring(0, 1) + b10.substring(0, 1) + b58.substring(0, 16)
      data.encodeNumber = b10.substring(0,6)
      data.encodeShort = data.prefixShort + bstr.substring(0, 8 - (data.suffixShort.length + data.prefixShort.length)) + data.suffixShort
      data.encodeLong = data.prefixLong + bstr.substring(0, 16 - (data.suffixLong.length + data.prefixLong.length)) + data.suffixLong
    } else {
      data.encodeNumber = ""
      data.encodeShort = ""
      data.encodeLong = ""
    }
})


let copiedTimeoutId:any = null
function copiedSetTimeout(copied: boolean) {
  if (copiedTimeoutId) {
    clearTimeout(copiedTimeoutId)
    copiedTimeoutId = null
  }
  if (copied) {
    copiedTimeoutId = setTimeout(function () {
      data.copied = false
    }, 5000)
  }
}
watch(
  () => data.copied,
  copiedSetTimeout,
)

function onNext() {
  data.step = 2
}

function onReset() {
  data.step = 1
  data.salt = ""
  data.prefixShort = ""
  data.suffixShort = ""
  data.prefixLong = ""
  data.suffixLong = ""
  data.text = ""
  data.encodeNumber = ""
  data.encodeShort = ""
  data.encodeLong = ""
  data.copied = false
}

function onConfirm() {
}

function onCopy(el:any) {
  // @
  let sel = document.getSelection()
  if (sel) {
    const selected = sel.rangeCount > 0 ? sel.getRangeAt(0) : false;
  el.target.select();
  copiedSetTimeout(true)
  textSetTimeout(data.text)
  data.copied = true
  document.execCommand('copy');
  }
}
</script>
<template>
  <main>
    <form action="post" autocomplete="off" v-if="data.step==1" @submit.prevent="onNext">
      <div :class="{'alert': true, 'alert-primary': true, 'alert-dismissible': true, 'fade': true, 'show': false}"
        role="alert">
        <div>XXX</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"
          @click.prevent="data.copied=false"></button>
      </div>
        <div class="mb-4">
          <label for="salt" class="form-label">Salt</label>
          <input type="text" class="form-control form-control-lg"  id="salt" v-model.trim="data.salt" required maxlength="64" />
        </div>
        <div class="mb-4">
          <label for="prefix-short" class="form-label">Prefix Short</label>
          <input type="text" class="form-control form-control-lg" id="prefix-short" v-model.trim="data.prefixShort" maxlength="16" />
        </div>
        <div class="mb-4">
          <label for="suffix-short" class="form-label">Suffix Short</label>
          <input type="text" class="form-control form-control-lg" id="suffix-short" v-model.trim="data.suffixShort" maxlength="16" />
        </div>
        <div class="mb-4">
          <label for="prefix-long" class="form-label">Prefix Long</label>
          <input type="text" class="form-control form-control-lg" id="prefix-long" v-model.trim="data.prefixLong" maxlength="16" />
        </div>
        <div class="mb-4">
          <label for="suffix-long" class="form-label">Suffix Long</label>
          <input type="text" class="form-control form-control-lg" id="suffix-long" v-model.trim="data.suffixLong" maxlength="16" />
        </div>
        <div class="mb-4">
          <button type="submit" class="btn btn-lg btn-block btn-primary">Next</button>
        </div>
    </form>
    <form action="post" v-else-if="data.step==2" @submit.prevent="onConfirm">
      <div :class="{'alert': true, 'alert-primary': true, 'alert-dismissible': true, 'fade': true, 'show': data.copied}" role="alert">
        <div>Encoded copied</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" @click.prevent="data.copied=false"></button>
      </div>
      <button type="button" class="btn btn-reset btn-link" @click.prevent="onReset">Reset</button>
      <div class="mb-4">
        <label for="text" class="form-label">Text</label>
        <input type="text" class="form-control form-control-lg" id="text" v-model.trim="data.text" />
      </div>
      <div class="mb-4" v-if="data.encodeNumber">
        <label for="encoded" class="form-label">Encoded Number:</label>
        <input class="form-control form-control-lg form-encode" readonly @click.prevent="onCopy"  :value="data.encodeNumber" />
      </div>
      <div class="mb-4" v-if="data.encodeShort">
        <label for="encoded" class="form-label">Encoded Short:</label>
        <input class="form-control form-control-lg form-encode" readonly @click.prevent="onCopy" :value="data.encodeShort" />
      </div>
      <div class="mb-4" v-if="data.encodeLong">
        <label for="encoded" class="form-label">Encoded Long:</label>
        <input class="form-control form-control-lg form-encode" readonly @click.prevent="onCopy" :value="data.encodeLong" />
      </div>
    </form>
  </main>
</template>
<style scoped>
.btn-block {
  display: block;
  width: 100%;
}

.btn-reset {
  margin: 0;
  padding: 0;
  float: right;
}
.form-encode {
  color: #e91e1e;
}
</style>
