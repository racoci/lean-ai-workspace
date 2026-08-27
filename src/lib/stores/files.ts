import { writable, get } from 'svelte/store';
import { saveFile, getAllFiles, getFile, deleteFile, type FileEntry } from '../utils/indexedDB';

export const files = writable<FileEntry[]>([]);
export const currentFileId = writable<string | null>(null);

let saveTimeout: ReturnType<typeof setTimeout>;

export async function initFiles() {
  const loadedFiles = await getAllFiles();
  if (loadedFiles.length === 0) {
    const defaultFile: FileEntry = {
      id: 'Main.lean',
      name: 'Main.lean',
      content: '-- Welcome to Lean AI Workspace\n\n#eval "Hello, world!"\n\ndef myTheorem : 1 + 1 = 2 := rfl\n',
      lastModified: Date.now()
    };
    await saveFile(defaultFile);
    files.set([defaultFile]);
    currentFileId.set(defaultFile.id);
  } else {
    files.set(loadedFiles);
    currentFileId.set(loadedFiles[0].id);
  }
}

export function updateCurrentFileContent(content: string) {
  const currentId = get(currentFileId);
  if (!currentId) return;

  // Optimistic update in memory
  files.update(allFiles => {
    return allFiles.map(f => {
      if (f.id === currentId) {
        return { ...f, content, lastModified: Date.now() };
      }
      return f;
    });
  });

  // Debounced Auto-Save to IndexedDB
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    const currentFiles = get(files);
    const fileToSave = currentFiles.find(f => f.id === currentId);
    if (fileToSave) {
      await saveFile(fileToSave);
      console.log(`Auto-saved ${fileToSave.name}`);
    }
  }, 1000);
}

export async function createNewFile(name: string) {
  let id = name;
  if (!id.endsWith('.lean')) {
    id += '.lean';
    name += '.lean';
  }
  
  const currentFiles = get(files);
  if (currentFiles.find(f => f.id === id)) {
    alert('File already exists!');
    return;
  }

  const newFile: FileEntry = {
    id,
    name,
    content: '',
    lastModified: Date.now()
  };

  await saveFile(newFile);
  files.update(fs => [...fs, newFile]);
  currentFileId.set(id);
}

export async function switchFile(id: string) {
  currentFileId.set(id);
}
