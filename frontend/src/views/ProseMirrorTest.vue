<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">ProseMirror Vue 测试</h1>
    <button @click="logEditorContent" class="bg-blue-500 text-white px-3 py-1 rounded mb-4">获取编辑内容</button>

    <!-- ✅ 让工具栏和编辑器在一个容器内 -->
    <div class="editor-container border min-h-[300px] p-4 bg-white rounded shadow-md">
      <div ref="editorMenu" class="editor-menu"></div> <!-- ✅ 工具栏 -->
      <div ref="editorContainer" class="editor-content"></div> <!-- ✅ 编辑器 -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "../utils/prosemirrorSchema";
import { exampleSetup } from "prosemirror-example-setup";
import { menuBar } from "prosemirror-menu";
import { buildMenuItems } from "../utils/prosemirrorMenu";
import "prosemirror-view/style/prosemirror.css";
import "prosemirror-menu/style/menu.css";

const editorContainer = ref(null);
const editorMenu = ref(null);
let editorView;

function initProseMirror() {
  // ✅ 生成菜单项
  const menu = menuBar({ content: buildMenuItems(schema) });

  editorView = new EditorView(editorContainer.value, {
    state: EditorState.create({
      doc: schema.node("doc", null, [schema.node("paragraph")]),
      plugins: [...exampleSetup({ schema }), menu],
    }),
  });

  // ✅ 修正 `menubar` 样式
  const menuElement = document.querySelector(".ProseMirror-menubar");
  if (menuElement) {
    menuElement.style.position = "relative"; // ✅ 让菜单栏固定在 `editor-container` 内部
    menuElement.style.minHeight = "auto"; // ✅ 取消 `min-height`
    menuElement.style.marginBottom = "10px"; // ✅ 让菜单与编辑器间隔开
    menuElement.style.display = "flex";
    menuElement.style.flexWrap = "wrap";
    menuElement.style.justifyContent = "flex-start";
    menuElement.style.background = "#f8f8f8";
    menuElement.style.padding = "5px";
    menuElement.style.borderBottom = "1px solid #ddd";
  }
}

function logEditorContent() {
  console.log("Editor Content:", editorView.state.doc.toJSON());
}

onMounted(() => {
  initProseMirror();
});
</script>

<style>
/* ✅ 修正 ProseMirror 样式 */
.ProseMirror {
  min-height: 300px !important;
  border: 1px solid #ddd;
  padding: 10px;
  outline: none;
  background: white;
  font-size: 16px;
  line-height: 1.6;
}

/* ✅ 解决 ProseMirror-menubar 高度问题 */
.ProseMirror-menubar {
  position: relative !important;
  min-height: auto !important;
  background: #f8f8f8;
  padding: 5px;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-wrap: wrap;
}

/* ✅ 让 ProseMirror-menubar 的工具栏正确显示 */
.ProseMirror-menubar-wrapper {
  display: flex;
  justify-content: flex-start;
  gap: 5px;
}

/* ✅ 处理 Tailwind 影响 */
.ProseMirror p {
  margin: 0;
}

.editor-container { 
  margin: auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  /* ✅ 让 `menubar` 和 `editor` 垂直排列 */
}

.editor-menu {
  background: #f1f1f1;
  padding: 5px;
}

.editor-content {
  min-height: 200px;
  padding: 10px;
}
</style>
