<template>
  <div>
    <b-form-input 
      v-model="localValue"
      v-if="editor === 'input'"
    ></b-form-input>

    <b-form-textarea 
      v-model="localValue" 
      max-rows="10" 
      rows="3" 
      v-if="editor === 'textarea'"
    ></b-form-textarea>

    <b-form-select
      v-model="localValue"
      :options="schema.enum"
      v-if="editor = 'select'"
    />

    <FileField 
      class="filefield"
      :schema="schema" 
      v-if="FileField.validate(schema)"
      v-model="imageUrl"
      :show="showFilePopup"
      @show="showFilePopup = $event"/>

    <vue-editor 
      v-model="localValue" 
      :editorOptions="editorSettings"
      v-if="editor === 'wysiwyg'"
    ></vue-editor>

    <prism-editor
      class="CodeEditor" 
      v-model="localValue" 
      :highlight="highlighter"
      v-if="editor === 'code'"
    ></prism-editor>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor";

import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-vim';

import FileField from './File';

export default {
  props: ['value', 'schema'],
  components: {
    VueEditor,
    PrismEditor,
    FileField
  },
  data(){
    const that = this;

    return {
      localValue: '',
      editorSettings: {
        modules: {
          toolbar: {
            container: [
              [{ 'header': [2, 3, 4, false] }],
              ['bold', 'italic', 'underline', 'link'],
              [
                { 'align': null },
                { 'align': 'center' },
                { 'align': 'right' }
              ],
              [
                { list: 'ordered' }, 
                { list: 'bullet' }
              ],
              [
                'image',
                'code-block'
              ],
              ['clean'],
            ],
            handlers: {
              image(){
                that.currentEditor = this;
                that.imageUrl = '';
                that.showFilePopup = true;
              }
            }
          }
        }
      },
      FileField,
      showFilePopup: false,
      imageUrl: ''
    }
  },
  computed: {
    editor(){
      if (!this.schema)
        return 'textarea';

      if (this.schema.enum)
        return 'select';

      if (this.schema.editor)
        return this.schema.editor;

      const maxLength = this.schema.maxlength;

      if (maxLength !== undefined && maxLength <= 200)
        return 'input';

      return 'textarea';
    }
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.vim);
    },
    rawToString(raw){
      if (!raw)
        return '';

      if (typeof raw === 'object')
        return JSON.stringify(raw, 0, 2);

      return raw.toString();
    }
  },
  mounted(){
    this.localValue = this.rawToString(this.value);
  },
  watch: {
    localValue(){
      this.$emit('input', this.localValue);
    },
    value(){
      const strValue = this.rawToString(this.value);
      if (this.localValue !== strValue)
        this.localValue = strValue;
    },
    imageUrl(){
      if (this.imageUrl){
        this.currentEditor.quill.focus();
        const range = this.currentEditor.quill.getSelection();
        this.currentEditor.quill.insertEmbed(range.index, 'image', this.imageUrl);
        this.imageUrl = '';
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.filefield {
  display: none;
}
</style>

<style lang="scss">
.ql-editor {
  line-height: 1.5em;
  font-family: Quicksand, sans-serif;

  h1, h2, h3, h4, h5, h6 {
    font-weight: bold;
  }

  h1 { font-size: 1.8em; margin-top: .8em; margin-bottom: .2em; }
  h2 { font-size: 1.5em; margin-top: .8em; margin-bottom: .2em; }
  h3 { font-size: 1.1em; margin-top: .8em; margin-bottom: .2em; }
  h4, h5, h6 { font-size: 1em; margin-top: .8em; margin-bottom: .2em; }

  p {
    margin-top: .8em !important; 
    margin-bottom: .2em !important;
  }  
}
</style>