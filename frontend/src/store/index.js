import { defineStore } from 'pinia';

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [],
    currentDocument: null,
  }),
  actions: {
    async fetchDocuments() {
      const response = await fetch('/api/documents');
      this.documents = await response.json();
    },
    async loadDocument(id) {
      const response = await fetch(`/api/documents/${id}`);
      this.currentDocument = await response.json();
    },
  },
});
