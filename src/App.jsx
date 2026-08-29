import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import landingLogo from '../assets/Stash2.svg';
import landingFrame1 from '../assets/Asset 01.svg';
import landingFrame2 from '../assets/Asset 02.svg';
import landingFrame3 from '../assets/Asset 03.svg';
import landingFrame4 from '../assets/Asset 04.svg';
import landingFrame5 from '../assets/Asset 05.svg';
import landingFrame6 from '../assets/Asset 06.svg';
import landingFrame7 from '../assets/Asset 07.svg';
import landingFrame8 from '../assets/Asset 08.svg';
import landingFrame9 from '../assets/Asset 09.svg';
import figmaTextIcon from '../assets/figma/text-size.svg';
import figmaShapesIcon from '../assets/figma/shapes.svg';
import figmaEyedropperIcon from '../assets/figma/eyedropper.svg';
import backgroundFillIcon from '../assets/Backgroundfill.svg';
import imageIcon from '../assets/Image.svg';

const folderColors = ['#D00000', '#11922B', '#004DAA', '#c5ab68', '#E45F00', '#111111'];
const folderPickerColors = ['#F39294', '#91D99A', '#82B2DD', '#EFD99B', '#FFAD7C', '#8d8d8d'];
const landingFrames = [landingFrame1, landingFrame2, landingFrame3, landingFrame4, landingFrame5, landingFrame6, landingFrame7, landingFrame8, landingFrame9];

const channels = (hex, shade = 1) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255].map((channel) => Math.round(channel * shade)).join(' ');
};
const isLightColor = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16);
  const [red, green, blue] = [value >> 16, (value >> 8) & 255, value & 255];
  return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 235;
};
const contrastingTextColor = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [value >> 16, (value >> 8) & 255, value & 255].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? '#000' : '#fff';
};
const swatchTone = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16);
  const [red, green, blue] = [value >> 16, (value >> 8) & 255, value & 255];
  const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  if (luminance < 105) return 'dark';
  if (luminance > 205) return 'bright';
  return '';
};
const findFolder = (folders, id) => folders.find((folder) => folder.id === id);

function GridWarpFilter() {
  return <svg className="glass-filter-defs" aria-hidden="true">
    <filter id="folder-grid-warp" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.027" numOctaves="1" seed="11" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>;
}

function FolderArt({ folder }) {
  const images = folder.items.slice(0, 3);
  return <div className="folder-art" style={{ '--folder': folder.color, '--folder-rgb': channels(folder.color), '--folder-dark-rgb': channels(folder.color, .62) }}>
    <svg className="folder-waves" viewBox="0 0 160 24" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 7 C20 2 38 11 58 6 C80 1 102 11 124 6 C143 2 152 7 160 4 V24 H0 Z" /></svg>
    <div className="art-items">{images.map((item, index) => <img key={item.id} className={`art-item art-item-${index}`} src={item.src} alt="" />)}</div>
    <span className="folder-icon">{folder.icon}</span>
  </div>;
}

function SearchBox({ value, onChange }) {
  return <label className="search-box"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search" value={value} onChange={(event) => onChange(event.target.value)} autoComplete="off" aria-label="Search stashes and items" /></label>;
}

function BackArrow() {
  return <svg className="back-arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 5l-7 7 7 7" /></svg>;
}

function KebabIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>;
}

function PencilIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 3.3 6 6-11.9 11.9-5.1 1.1 1.1-5.1L16.7 5.3l-2-2Z" /><path d="m13.2 6.8 4 4" /></svg>;
}

function FolderIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.75A1.75 1.75 0 0 1 5.25 5h4.3l1.7 2h7.5a1.75 1.75 0 0 1 1.75 1.75v8.5A1.75 1.75 0 0 1 18.75 19h-13A1.75 1.75 0 0 1 4 17.25V8.75A1.75 1.75 0 0 1 5.75 7h5.5" /></svg>;
}

function PaletteIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.75 3 2.5 6.8 2.5 11.5S6.75 20 12 20h1.35c1.18 0 1.8-1.32 1.04-2.22-.4-.48-.68-1.08-.68-1.78 0-1.45 1.18-2.63 2.64-2.63H18c2.02 0 3.5-1.54 3.5-3.44C21.5 6.1 17.25 3 12 3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10.5" cy="7.5" r="1" /><circle cx="15" cy="8" r="1" /></svg>;
}

function ModeToggle({ mode, onChange, className = '' }) {
  const isMoodboard = mode === 'moodboard';
  return <div className={`mode-toggle ${className}`}>
    <button type="button" className={!isMoodboard ? 'active' : ''} aria-label="Stash" title="Stash" aria-pressed={!isMoodboard} onClick={() => onChange('stash')}><FolderIcon /></button>
    <button type="button" className={isMoodboard ? 'active' : ''} aria-label="Moodboard" title="Moodboard" aria-pressed={isMoodboard} onClick={() => onChange('moodboard')}><PaletteIcon /></button>
  </div>;
}

function EyeIcon({ open }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" />{!open && <path d="m4 4 16 16" />}</svg>;
}

function Landing({ onEnter }) {
  return <main className="landing-screen">
    <div className="landing-brand"><img src={landingLogo} alt="Stash" /></div>
    <div className="landing-art" aria-hidden="true">{landingFrames.map((frame, index) => <img key={frame} src={frame} alt="" style={{ '--frame-index': index }} />)}</div>
    <p className="landing-message">Turn physical inspiration<br />into digital artefacts.</p>
    <button className="landing-cta" type="button" onClick={onEnter}>Let’s Stash</button>
  </main>;
}

function Home({ folders, search, setSearch, openFolder, openItem, openFolderModal, openItemModal, onModeChange }) {
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return null;
    const terms = query.split(/\s+/);
    return folders.flatMap((folder) => folder.items.map((item) => ({ ...item, folder }))).filter((item) => {
      const nameWords = item.name.toLowerCase().split(/\s+/);
      return terms.every((term) => nameWords.some((word) => word.startsWith(term)));
    });
  }, [folders, search]);
  return <section className={`screen ${matches ? 'search-screen' : 'home-screen'}`}>
    <div className="intro"><div className="intro-brand-row"><img className="brand-logo" src={`${import.meta.env.BASE_URL}stash.svg`} alt="Stash" /></div><SearchBox value={search} onChange={setSearch} /><div className="actions"><button className="btn btn-dark primary-action" onClick={openFolderModal}><span className="button-plus" aria-hidden="true">+</span>Create Stash</button>{folders.length > 0 && <button className="btn btn-orange primary-action" onClick={openItemModal}><span className="button-plus" aria-hidden="true">+</span>Add Item</button>}<ModeToggle mode="stash" onChange={onModeChange} /></div></div>
    {matches ? <><p className="result-count">{matches.length} {matches.length === 1 ? 'Result' : 'Results'}</p><div className="search-grid">{matches.length ? matches.map((item) => <button key={`${item.folder.id}-${item.id}`} className="search-result" onClick={() => openItem(item.folder.id, item.id)}><img src={item.src} alt={item.name} /><span>{item.name}</span></button>) : <p className="empty">No items match that search.</p>}</div></> : <div className="folder-grid">{folders.length ? folders.map((folder) => <button key={folder.id} className="folder-card" onClick={() => openFolder(folder.id)}><FolderArt folder={folder} /><strong>{folder.name}</strong><small>{folder.items.length} {folder.items.length === 1 ? 'item' : 'items'}</small></button>) : <p className="empty">Empty for now. Create your first stash!</p>}</div>}
  </section>;
}

function MoodboardLibrary({ moodboards, search, setSearch, createMoodboard, openMoodboard, deleteMoodboard, onModeChange }) {
  const [menuMoodboardId, setMenuMoodboardId] = useState('');
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuMoodboardId) return undefined;
    const closeMenuOnClickAway = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuMoodboardId('');
    };
    document.addEventListener('pointerdown', closeMenuOnClickAway);
    return () => document.removeEventListener('pointerdown', closeMenuOnClickAway);
  }, [menuMoodboardId]);
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return moodboards;
    return moodboards.filter((moodboard) => moodboard.name.toLowerCase().includes(query));
  }, [moodboards, search]);
  return <section className="screen home-screen moodboard-library-screen">
    <div className="intro"><div className="intro-brand-row"><img className="brand-logo" src={`${import.meta.env.BASE_URL}stash.svg`} alt="Stash" /></div><SearchBox value={search} onChange={setSearch} /><div className="actions"><button className="btn btn-dark primary-action" onClick={createMoodboard}><span className="button-plus" aria-hidden="true">+</span>Create Moodboard</button><ModeToggle mode="moodboard" onChange={onModeChange} /></div></div>
    {search.trim() && <p className="result-count">{matches.length} {matches.length === 1 ? 'Result' : 'Results'}</p>}
    <div className="folder-grid moodboard-grid">{matches.length ? matches.map((moodboard) => {
      const isMenuOpen = menuMoodboardId === moodboard.id;
      return <div key={moodboard.id} className="folder-card moodboard-card" ref={isMenuOpen ? menuRef : null}><button type="button" className="moodboard-open" onClick={() => openMoodboard(moodboard.id)} aria-label={`Open ${moodboard.name}`}><MoodboardThumbnail moodboard={moodboard} /><strong>{moodboard.name}</strong><small>Moodboard</small></button><button type="button" className="moodboard-kebab" aria-label={`More options for ${moodboard.name}`} title="More options" aria-expanded={isMenuOpen} aria-haspopup="menu" onClick={() => setMenuMoodboardId((current) => current === moodboard.id ? '' : moodboard.id)}><KebabIcon /></button>{isMenuOpen && <div className="moodboard-menu-panel" role="menu" aria-label={`${moodboard.name} options`}><button type="button" role="menuitem" className="moodboard-menu-delete" onClick={() => { deleteMoodboard(moodboard.id); setMenuMoodboardId(''); }}>Delete</button></div>}</div>;
    }) : <p className="empty">{moodboards.length ? 'No moodboards match that search.' : 'Empty for now. Create your first moodboard!'}</p>}</div>
  </section>;
}

const moodboardShapes = { square: '■', circle: '●', arch: '◖' };
// Keep enough of the collapsed sheet above the bottom edge for the grab handle
// to remain unmistakably visible (including on phones with bottom UI insets).
const collapsedDrawerPeek = 54;
const moodboardFonts = [
  { value: 'Erode, Georgia, serif', label: 'Erode' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Sans' },
  { value: 'Georgia, serif', label: 'Classic' },
  { value: 'cursive', label: 'Script' },
];
// A moodboard object has the same placement every 180 degrees, but its content
// would be upside down. Keep the equivalent angle in the upright half-turn for
// both the object and its selection controls.
const uprightRotation = (rotation = 0) => ((rotation + 90) % 180 + 180) % 180 - 90;
function MoodboardThumbnail({ moodboard }) {
  const board = moodboard.canvas || {};
  const objects = board.objects || [];
  return <span className="moodboard-thumbnail" style={{ background: board.background || '#fff' }} aria-hidden="true">
    {objects.map((object) => <span key={object.id} className={`moodboard-thumbnail-object ${object.type}`} style={{ left: `${object.x}%`, top: `${object.y}%`, '--thumbnail-colour': object.color, '--thumbnail-scale': object.scale || 1, '--thumbnail-rotation': `${uprightRotation(object.rotation)}deg`, ...(object.type === 'image' ? { width: `${object.size || 88}px`, height: `${object.size || 88}px` } : {}), ...(object.type === 'text' ? { '--thumbnail-text-width': `${object.width || 180}px`, '--thumbnail-font': object.fontFamily || moodboardFonts[0].value, '--thumbnail-align': object.textAlign || 'left' } : {}) }}>
      {object.type === 'image' && <img src={object.src} alt="" />}
      {object.type === 'shape' && <i className={`thumbnail-shape-${object.shape}`} />}
      {object.type === 'text' && <i>{object.text}</i>}
      {object.type === 'swatch' && <i />}
    </span>)}
  </span>;
}
function MoodboardDrawerItem({ item, onAdd, onOpenColours }) {
  return <div className="drawer-item-wrap"><button className="drawer-item" type="button" onClick={() => onAdd(item)}><img src={item.src} alt={item.name} /><span>{item.name}</span></button>{item.colors?.length > 0 && <button className="drawer-item-swatches" type="button" onClick={(event) => onOpenColours(item, event.currentTarget)} aria-haspopup="dialog" aria-label={`Choose from ${item.name} colours`} title={`Choose from ${item.name} colours`}><span aria-hidden="true">{item.colors.map((colour) => <i key={colour} style={{ '--swatch-colour': colour }} />)}</span></button>}</div>;
}
function Moodboard({ folders, moodboard, onRename, onCanvasChange, onBack }) {
  const savedCanvas = moodboard.canvas || {};
  const [activeFolderId, setActiveFolderId] = useState(folders[0]?.id || '');
  const [background, setBackground] = useState(savedCanvas.background || '#ffffff');
  const [activeColour, setActiveColour] = useState(savedCanvas.activeColour || '#ff8248');
  const [activeFont, setActiveFont] = useState(savedCanvas.activeFont || moodboardFonts[0].value);
  const [objects, setObjects] = useState(savedCanvas.objects || []);
  const [selectedId, setSelectedId] = useState('');
  const [drawerOffset, setDrawerOffset] = useState(0);
  const [drawerSnap, setDrawerSnap] = useState('collapsed');
  const [drawerDragging, setDrawerDragging] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(0);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [paletteItem, setPaletteItem] = useState(null);
  const [paletteAnchor, setPaletteAnchor] = useState(null);
  const screenRef = useRef(null);
  const drawerRef = useRef(null);
  const canvasRef = useRef(null);
  const selectedObjectRef = useRef(null);
  const palettePickerRef = useRef(null);
  const textInputRefs = useRef({});
  const photoInputRef = useRef(null);
  const titleInputRef = useRef(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(moodboard.name);
  const [selectionBox, setSelectionBox] = useState(null);
  const drawerStart = useRef(null);
  const ignoreDrawerClick = useRef(false);
  const objectDrag = useRef(null);
  const objectResize = useRef(null);
  const objectRotate = useRef(null);
  useEffect(() => {
    if (!isEditingTitle) setTitleDraft(moodboard.name);
  }, [isEditingTitle, moodboard.name]);
  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus();
  }, [isEditingTitle]);
  useEffect(() => {
    onCanvasChange({ background, activeColour, activeFont, objects });
  }, [activeColour, activeFont, background, objects, onCanvasChange]);
  const saveTitle = () => {
    const nextTitle = titleDraft.trim();
    if (nextTitle) onRename(nextTitle);
    else setTitleDraft(moodboard.name);
    setIsEditingTitle(false);
  };
  const suppressObjectClick = useRef(false);
  const activeFolder = findFolder(folders, activeFolderId) || folders[0];
  const filteredItems = activeFolder?.items.filter((item) => item.name.toLowerCase().includes(drawerSearch.trim().toLowerCase())) || [];
  const selectedObject = objects.find((object) => object.id === selectedId);
  const drawerSnapOffsets = useMemo(() => ({
    expanded: 0,
    // Leave only the grab area exposed while keeping the drawer reachable.
    collapsed: Math.max(0, drawerHeight - collapsedDrawerPeek),
  }), [drawerHeight]);

  useLayoutEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return undefined;
    const updateDimensions = () => {
      setDrawerHeight(drawer.getBoundingClientRect().height);
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(drawer);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const selectedObject = selectedObjectRef.current;
    if (!canvas || !selectedObject || !selectedId) {
      setSelectionBox(null);
      return undefined;
    }
    const updateSelectionBox = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const objectRect = selectedObject.getBoundingClientRect();
      // Read the final transform from the browser instead of reconstructing it
      // from viewport dimensions. This includes both the object's saved scale
      // and the responsive mobile scale, so the selection border stays glued
      // to a shape while it is resized.
      const transform = window.getComputedStyle(selectedObject).transform;
      const matrixValues = transform.match(/^matrix\((.+)\)$/)?.[1].split(',').map(Number);
      const renderedScale = matrixValues ? Math.hypot(matrixValues[0], matrixValues[1]) : 1;
      // offsetWidth/offsetHeight describe the object before its CSS rotation.
      // Position this box from the transformed object's center, then rotate the
      // box itself so the outline and its controls stay attached to the object.
      const width = selectedObject.offsetWidth * renderedScale;
      const height = selectedObject.offsetHeight * renderedScale;
      const centerX = objectRect.left + objectRect.width / 2;
      const centerY = objectRect.top + objectRect.height / 2;
      setSelectionBox({
        left: centerX - canvasRect.left - canvas.clientLeft - width / 2,
        top: centerY - canvasRect.top - canvas.clientTop - height / 2,
        width,
        height,
      });
    };
    updateSelectionBox();
    const observer = new ResizeObserver(updateSelectionBox);
    observer.observe(canvas);
    observer.observe(selectedObject);
    return () => observer.disconnect();
  }, [objects, selectedId]);
  useLayoutEffect(() => {
    // A textarea does not grow to its wrapped contents by itself. Resetting
    // then measuring it makes its height follow the rendered line count while
    // keeping the font size independent from the box width.
    Object.values(textInputRefs.current).forEach((input) => {
      if (!input) return;
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight}px`;
    });
  }, [objects]);
  useEffect(() => {
    if (!paletteItem) return undefined;
    const dismissPalette = (event) => {
      if (!palettePickerRef.current?.contains(event.target)) {
        setPaletteItem(null);
        setPaletteAnchor(null);
      }
    };
    const dismissOnEscape = (event) => {
      if (event.key === 'Escape') {
        setPaletteItem(null);
        setPaletteAnchor(null);
      }
    };
    window.addEventListener('pointerdown', dismissPalette);
    window.addEventListener('keydown', dismissOnEscape);
    return () => {
      window.removeEventListener('pointerdown', dismissPalette);
      window.removeEventListener('keydown', dismissOnEscape);
    };
  }, [paletteItem]);
  const openPalette = (item, trigger) => {
    const rect = trigger.getBoundingClientRect();
    setPaletteAnchor({ left: rect.left + rect.width / 2, top: rect.top + rect.height / 2 });
    setPaletteItem(item);
  };
  const selectObject = (id) => setSelectedId(id);
  const addObject = (type, payload = {}) => {
    const id = `board-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const offset = 24 + (objects.length % 4) * 12;
    const object = { id, type, x: offset, y: offset, ...payload };
    setObjects((current) => [...current, object]);
    setSelectedId(id);
  };
  const addItem = (item) => addObject('image', { src: item.src, name: item.name, size: 88 });
  const addShape = (shape) => addObject('shape', { shape, color: activeColour, scale: 1, showColourCode: false });
  const addText = () => addObject('text', { text: 'A little idea', color: activeColour, fontFamily: activeFont, scale: 1, width: 180, textAlign: 'left' });
  const changeFont = (fontFamily) => {
    setActiveFont(fontFamily);
    setObjects((current) => current.map((object) => (
      object.id === selectedId && object.type === 'text' ? { ...object, fontFamily } : object
    )));
  };
  const addOwnPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => addObject('image', { src: reader.result, name: file.name.replace(/\.[^.]+$/, '') || 'My photo', size: 120 });
    reader.readAsDataURL(file);
    event.target.value = '';
  };
  const applyBoardColour = (colour) => {
    setActiveColour(colour);
    // A picked colour is also an edit operation when a colourable board
    // object is selected; otherwise it remains the colour for new objects.
    setObjects((current) => current.map((object) => (
      object.id === selectedId && (object.type === 'shape' || object.type === 'text')
        ? { ...object, color: colour }
        : object
    )));
  };
  const pickBoardColour = async () => {
    // The browser's EyeDropper keeps the canvas visible and provides the
    // magnified sampler. A native colour input opens an RGB picker instead.
    if (!('EyeDropper' in window)) return;
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      applyBoardColour(sRGBHex);
    } catch {
      // Dismissing the sampler is an expected no-op.
    }
  };
  const beginDrawerDrag = (event, fromContent = false) => {
    const interactiveTarget = event.target.closest?.('button, input');
    if (interactiveTarget && (fromContent || !interactiveTarget.classList.contains('drawer-grab'))) return;
    if (fromContent && event.currentTarget.scrollTop > 0) return;
    drawerStart.current = { y: event.clientY, offset: drawerSnapOffsets[drawerSnap], fromContent, dragStarted: false };
    if (!fromContent) {
      if (event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId);
    }
  };
  const moveDrawerDrag = (event) => {
    if (!drawerStart.current) return;
    const moved = event.clientY - drawerStart.current.y;
    if (!drawerStart.current.dragStarted && Math.abs(moved) < 4) return;
    if (drawerStart.current.fromContent) {
      if (event.currentTarget.scrollTop > 0 || moved <= 0) return;
      if (event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId);
    }
    drawerStart.current.dragStarted = true;
    setDrawerDragging(true);
    setDrawerOffset(Math.max(0, Math.min(drawerSnapOffsets.collapsed, drawerStart.current.offset + moved)));
  };
  const endDrawerDrag = (event) => {
    if (!drawerStart.current) return;
    if (!drawerStart.current.dragStarted) {
      drawerStart.current = null;
      setDrawerDragging(false);
      return;
    }
    const moved = event.clientY - drawerStart.current.y;
    const finalOffset = Math.max(0, Math.min(drawerSnapOffsets.collapsed, drawerStart.current.offset + moved));
    const nextSnap = Object.entries(drawerSnapOffsets).reduce((closest, [snap, offset]) => Math.abs(offset - finalOffset) < Math.abs(drawerSnapOffsets[closest] - finalOffset) ? snap : closest, 'collapsed');
    setDrawerSnap(nextSnap);
    setDrawerOffset(drawerSnapOffsets[nextSnap]);
    drawerStart.current = null;
    ignoreDrawerClick.current = true;
    window.setTimeout(() => { ignoreDrawerClick.current = false; }, 0);
    setDrawerDragging(false);
  };
  const cancelDrawerDrag = () => {
    if (!drawerStart.current) return;
    setDrawerOffset(drawerSnapOffsets[drawerSnap]);
    drawerStart.current = null;
    setDrawerDragging(false);
  };
  const toggleDrawer = () => {
    if (ignoreDrawerClick.current) {
      ignoreDrawerClick.current = false;
      return;
    }
    setDrawerSnap((snap) => snap === 'collapsed' ? 'expanded' : 'collapsed');
  };
  const beginObjectDrag = (event, object, preserveTextTap = false) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // A touch on text can still place the caret when it remains a tap. If the
    // finger moves, the shared pointer-move path below turns it into a drag.
    if (!preserveTextTap) event.preventDefault();
    event.stopPropagation();
    objectDrag.current = { id: object.id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: object.x, originY: object.y, moved: false, textInput: preserveTextTap ? event.currentTarget : null };
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Some touch browsers reject pointer capture after a rapid re-render.
      // The canvas reference below still keeps the drag safe to continue.
    }
    selectObject(object.id);
  };
  const beginObjectResize = (event, object, corner) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = corner.includes('right') ? 1 : -1;
    const sy = corner.includes('bottom') ? 1 : -1;
    const objectRect = selectedObjectRef.current?.getBoundingClientRect();
    if (!objectRect?.width || !objectRect.height) return;
    objectResize.current = {
      id: object.id,
      type: object.type,
      pointerId: event.pointerId,
      sx,
      sy,
      width: objectRect.width,
      height: objectRect.height,
      scale: object.scale || 1,
      oppositeX: sx === 1 ? objectRect.left : objectRect.right,
      oppositeY: sy === 1 ? objectRect.top : objectRect.bottom,
    };
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // The window listeners still provide a fallback on browsers that reject
      // capture during a touch gesture.
    }
    selectObject(object.id);
  };
  const moveObjectResize = (event) => {
    const resize = objectResize.current;
    if (!resize || event.pointerId !== resize.pointerId) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const horizontalSize = resize.sx * (event.clientX - resize.oppositeX);
    const verticalSize = resize.sy * (event.clientY - resize.oppositeY);
    if (resize.type === 'text') {
      // Text boxes begin at their content width. Once a resize handle is
      // moved, retain that explicit width so text wraps naturally as the box
      // becomes narrower.
      const width = Math.max(40, horizontalSize / resize.scale);
      const visualWidth = width * resize.scale;
      const centerX = resize.oppositeX + resize.sx * visualWidth / 2;
      const x = Math.max((visualWidth / 2 / rect.width) * 100, Math.min(100 - (visualWidth / 2 / rect.width) * 100, ((centerX - rect.left) / rect.width) * 100));
      setObjects((current) => current.map((object) => object.id === resize.id ? { ...object, x, width } : object));
      return;
    }
    // Let the axis the user has moved furthest control a proportional resize.
    // Using the larger size ratio prevented an object from shrinking when the
    // other axis stayed at its original size (for example, dragging a text
    // corner inward mostly horizontally).
    const horizontalScale = horizontalSize / resize.width;
    const verticalScale = verticalSize / resize.height;
    const scaleFactor = Math.abs(horizontalScale - 1) >= Math.abs(verticalScale - 1)
      ? horizontalScale
      : verticalScale;
    const scale = Math.max(0.4, Math.min(4, resize.scale * scaleFactor));
    const width = resize.width * (scale / resize.scale);
    const height = resize.height * (scale / resize.scale);
    const centerX = resize.oppositeX + resize.sx * width / 2;
    const centerY = resize.oppositeY + resize.sy * height / 2;
    const x = Math.max((width / 2 / rect.width) * 100, Math.min(100 - (width / 2 / rect.width) * 100, ((centerX - rect.left) / rect.width) * 100));
    const y = Math.max((height / 2 / rect.height) * 100, Math.min(100 - (height / 2 / rect.height) * 100, ((centerY - rect.top) / rect.height) * 100));
    setObjects((current) => current.map((object) => object.id === resize.id ? { ...object, x, y, scale } : object));
  };
  const finishObjectResize = (event) => {
    if (!objectResize.current || (event && event.pointerId !== objectResize.current.pointerId)) return;
    objectResize.current = null;
    suppressObjectClick.current = true;
  };
  const beginObjectRotate = (event, object) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const objectRect = selectedObjectRef.current?.getBoundingClientRect();
    if (!objectRect) return;
    // Keep the center fixed for the entire gesture. Measuring it again after
    // each render can make a rotated element chase its changing bounding box.
    const centerX = objectRect.left + objectRect.width / 2;
    const centerY = objectRect.top + objectRect.height / 2;
    const startCursorAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI;
    objectRotate.current = {
      id: object.id,
      pointerId: event.pointerId,
      centerX,
      centerY,
      // Preserve the relationship between the cursor and the handle at the
      // moment rotation begins, so the object does not snap on first move.
      lastCursorAngle: startCursorAngle,
      rotation: object.rotation || 0,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    selectObject(object.id);
  };
  const moveObjectRotate = (event) => {
    const rotate = objectRotate.current;
    if (!rotate || event.pointerId !== rotate.pointerId) return;
    event.preventDefault();
    const cursorAngle = Math.atan2(event.clientY - rotate.centerY, event.clientX - rotate.centerX) * 180 / Math.PI;
    // atan2 wraps from 180° to -180°. Unwrap that boundary so a cursor moving
    // smoothly across it cannot make the object jump through a full turn.
    const angleDelta = ((cursorAngle - rotate.lastCursorAngle + 540) % 360) - 180;
    rotate.lastCursorAngle = cursorAngle;
    // Let the pointer movement remain continuous, but render the equivalent
    // upright angle so the object's content can never end up upside down.
    rotate.rotation += angleDelta;
    const rotation = Math.round(uprightRotation(rotate.rotation));
    setObjects((current) => current.map((object) => object.id === rotate.id ? { ...object, rotation } : object));
  };
  const finishObjectRotate = (event) => {
    if (!objectRotate.current || (event && event.pointerId !== objectRotate.current.pointerId)) return;
    objectRotate.current = null;
    suppressObjectClick.current = true;
  };
  const moveObjectDrag = (event) => {
    const drag = objectDrag.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    if (Math.abs(event.clientX - drag.x) > 2 || Math.abs(event.clientY - drag.y) > 2) {
      drag.moved = true;
      drag.textInput?.blur();
    }
    const nextX = Math.max(7, Math.min(93, drag.originX + ((event.clientX - drag.x) / rect.width) * 100));
    const nextY = Math.max(7, Math.min(93, drag.originY + ((event.clientY - drag.y) / rect.height) * 100));
    const draggedId = drag.id;
    setObjects((current) => current.map((object) => object.id === draggedId ? { ...object, x: nextX, y: nextY } : object));
  };
  const finishObjectDrag = (event) => {
    const drag = objectDrag.current;
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    suppressObjectClick.current = drag.moved;
    objectDrag.current = null;
  };
  const deleteObject = (id) => {
    setObjects((current) => current.filter((object) => object.id !== id));
    setSelectedId((current) => current === id ? '' : current);
  };
  const clearCanvas = () => {
    setObjects([]);
    setSelectedId('');
    setShapeMenuOpen(false);
    setPaletteItem(null);
    setPaletteAnchor(null);
  };
  const updateText = (id, text) => {
    setObjects((current) => current.map((object) => object.id === id ? { ...object, text } : object));
  };
  const toggleShapeColourCode = (id) => {
    setObjects((current) => current.map((object) => (
      object.id === id ? { ...object, showColourCode: !object.showColourCode } : object
    )));
  };
  useEffect(() => {
    // Listen at the window as a fallback for mobile browsers where pointer
    // capture can be dropped during a component update.
    const onMove = (event) => {
      if (objectResize.current) moveObjectResize(event);
      else if (objectRotate.current) moveObjectRotate(event);
      else moveObjectDrag(event);
    };
    const onEnd = (event) => {
      if (objectResize.current) finishObjectResize(event);
      else if (objectRotate.current) finishObjectRotate(event);
      else finishObjectDrag(event);
    };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  }, []);
  return <section ref={screenRef} className="moodboard-screen">
    <header className="moodboard-header"><button className="round-btn moodboard-back" onClick={onBack} aria-label="Back to moodboards"><BackArrow /></button><div className="moodboard-title">{isEditingTitle ? <input ref={titleInputRef} value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} onBlur={saveTitle} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); saveTitle(); } if (event.key === 'Escape') { setTitleDraft(moodboard.name); setIsEditingTitle(false); } }} aria-label="Moodboard title" maxLength="60" /> : <h1>{moodboard.name}</h1>}<button type="button" className="moodboard-title-edit" onClick={() => setIsEditingTitle(true)} aria-label="Edit moodboard title" title="Edit title"><PencilIcon /></button></div></header>
    <main className="moodboard-workspace">
      <div className="moodboard-toolbar" role="toolbar" aria-label="Moodboard tools">
        <div className="moodboard-tool-group">
          <button type="button" onClick={addText} aria-label="Add text"><img src={figmaTextIcon} alt="" /></button>
          <label className="board-font" title="Change text font"><span aria-hidden="true">Aa</span><select value={activeFont} onChange={(event) => changeFont(event.target.value)} aria-label="Text font">{moodboardFonts.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}</select></label>
          <div className="shape-menu"><button type="button" onClick={() => setShapeMenuOpen((open) => !open)} aria-label="Add shape" aria-expanded={shapeMenuOpen}><img src={figmaShapesIcon} alt="" /></button>{shapeMenuOpen && <div>{Object.entries(moodboardShapes).map(([key, icon]) => <button key={key} type="button" onClick={() => { addShape(key); setShapeMenuOpen(false); }} aria-label={`Add ${key}`}>{icon}</button>)}</div>}</div>
          <button className="board-photo" type="button" onClick={() => photoInputRef.current?.click()} aria-label="Add your own photo" title="Add your own photo"><img src={imageIcon} alt="" /></button>
          <input ref={photoInputRef} className="photo-upload-input" type="file" accept="image/*" onChange={addOwnPhoto} aria-label="Choose a photo to add" />
          <label className="board-background" title="Canvas background colour"><img src={backgroundFillIcon} alt="" /><input type="color" value={background} onChange={(event) => setBackground(event.target.value)} aria-label="Canvas background colour" /></label>
          <button className="board-eyedropper" type="button" onClick={pickBoardColour} aria-label="Pick a colour from the canvas" title="Pick a colour from the canvas"><img src={figmaEyedropperIcon} alt="" /></button>
        </div>
        <button className="clear-canvas" type="button" onClick={clearCanvas} aria-label="Clear canvas" title="Clear canvas">Clear</button>
      </div>
      <div ref={canvasRef} className="moodboard-canvas" style={{ background }} onClick={() => setSelectedId('')}>
        {objects.map((object) => <div key={object.id} ref={selectedId === object.id ? selectedObjectRef : null} role="button" tabIndex="0" className={`board-object ${object.type} ${selectedId === object.id ? 'selected' : ''}`} style={{ left: `${object.x}%`, top: `${object.y}%`, '--object-colour': object.color, '--object-scale': object.scale || 1, '--object-rotation': `${uprightRotation(object.rotation)}deg`, ...(object.type === 'image' ? { width: `${object.size || 88}px`, height: `${object.size || 88}px` } : {}), ...(object.type === 'text' ? { '--text-width': `${object.width || 180}px`, '--text-align': object.textAlign || 'left', '--text-font': object.fontFamily || moodboardFonts[0].value } : {}) }} onPointerDown={(event) => beginObjectDrag(event, object)} onClick={(event) => { event.stopPropagation(); if (suppressObjectClick.current) { suppressObjectClick.current = false; return; } selectObject(object.id); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectObject(object.id); } }}>
          {object.type === 'image' && <img src={object.src} alt={object.name} draggable="false" />}{object.type === 'shape' && <span className={`shape-${object.shape}`} role="img" aria-label={object.shape}>{object.showColourCode && <b className="shape-colour-code" style={{ '--shape-code-colour': contrastingTextColor(object.color) }}>{object.color.toUpperCase()}</b>}</span>}{object.type === 'text' && <textarea ref={(node) => { if (node) textInputRefs.current[object.id] = node; else delete textInputRefs.current[object.id]; }} className="board-text-input" rows="1" value={object.text} aria-label="Moodboard text" onPointerDown={(event) => { if (event.pointerType === 'touch') beginObjectDrag(event, object, true); else { event.stopPropagation(); selectObject(object.id); } }} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} onChange={(event) => updateText(object.id, event.target.value)} />}{object.type === 'swatch' && <span />}</div>)}
        {selectionBox && selectedObject && <div className="board-selection-box" style={{ left: selectionBox.left, top: selectionBox.top, width: selectionBox.width, height: selectionBox.height, '--selection-rotation': `${uprightRotation(selectedObject.rotation)}deg` }} onPointerDown={(event) => beginObjectDrag(event, selectedObject)} onClick={(event) => event.stopPropagation()}><button className="board-object-delete" type="button" aria-label={`Delete ${selectedObject.type === 'image' ? selectedObject.name : selectedObject.type}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); deleteObject(selectedObject.id); }}>×</button>{selectedObject.type === 'shape' && <button className={`board-shape-eye ${selectedObject.showColourCode ? 'is-visible' : ''}`} type="button" aria-label={`${selectedObject.showColourCode ? 'Hide' : 'Show'} ${selectedObject.color.toUpperCase()} colour code`} aria-pressed={Boolean(selectedObject.showColourCode)} title={`${selectedObject.showColourCode ? 'Hide' : 'Show'} colour code`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); toggleShapeColourCode(selectedObject.id); }}><EyeIcon open={selectedObject.showColourCode} /></button>}{(selectedObject.type === 'text' ? ['middle-left', 'middle-right'] : ['top-left', 'top-right', 'bottom-left', 'bottom-right']).map((corner) => <button type="button" key={corner} className={`board-resize-handle ${corner}`} aria-label={`Resize ${selectedObject.type} from ${corner.replace('-', ' ')}`} onPointerDown={(event) => beginObjectResize(event, selectedObject, corner)} onPointerMove={moveObjectResize} onPointerUp={finishObjectResize} onPointerCancel={finishObjectResize} />)}<button className="board-rotate-handle" type="button" aria-label={`Rotate ${selectedObject.type}. Current angle ${uprightRotation(selectedObject.rotation)} degrees`} onPointerDown={(event) => beginObjectRotate(event, selectedObject)}><span aria-hidden="true">↻</span><output>{uprightRotation(selectedObject.rotation)}°</output></button></div>}
        {!objects.length && <div className="canvas-empty"><b>Build the feeling.</b><span>Tap an item below to place it here.</span></div>}
      </div>
    </main>
    <div className={`moodboard-drawer-shell ${drawerDragging ? 'is-dragging' : ''}`} style={{ '--drawer-offset': drawerHeight ? `${drawerDragging ? drawerOffset : drawerSnapOffsets[drawerSnap]}px` : `calc(100% - ${collapsedDrawerPeek}px)` }}><aside ref={drawerRef} className="moodboard-drawer" aria-label="Your stashes"><div className="drawer-sheet-header" onPointerDown={beginDrawerDrag} onPointerMove={moveDrawerDrag} onPointerUp={endDrawerDrag} onPointerCancel={cancelDrawerDrag}><button className="drawer-grab" type="button" onClick={toggleDrawer} aria-expanded={drawerSnap !== 'collapsed'} aria-label={`Stash drawer: ${drawerSnap}. Activate to change size.`}><span /></button><div className="stash-tabs" aria-label="Choose a stash">{folders.map((folder) => <button key={folder.id} type="button" className={activeFolder?.id === folder.id ? 'active' : ''} onClick={() => { setActiveFolderId(folder.id); setDrawerSearch(''); }}>{folder.icon} {folder.name}</button>)}</div>{!folders.length && <p className="drawer-empty-stashes">Create a stash to add your own finds</p>}</div>{activeFolder && <div className="drawer-content"><label className="drawer-search"><span aria-hidden="true">⌕</span><input type="search" value={drawerSearch} onChange={(event) => setDrawerSearch(event.target.value)} placeholder="Search" aria-label="Search this stash" /></label><div className="drawer-items" onPointerDown={(event) => beginDrawerDrag(event, true)} onPointerMove={moveDrawerDrag} onPointerUp={endDrawerDrag} onPointerCancel={cancelDrawerDrag}>{filteredItems.length ? filteredItems.map((item) => <MoodboardDrawerItem key={item.id} item={item} onAdd={addItem} onOpenColours={openPalette} />) : <p>{activeFolder.items.length ? 'No items match your search.' : 'This stash is empty. Add an item, then come back to compose.'}</p>}</div></div>}</aside></div>
    {paletteItem && paletteAnchor && <section ref={palettePickerRef} className="drawer-colour-picker" role="dialog" aria-modal="false" aria-label={`Choose a colour from ${paletteItem.name}`} style={{ left: paletteAnchor.left, top: paletteAnchor.top }}><div>{paletteItem.colors.map((colour) => <button key={colour} type="button" className={activeColour.toLowerCase() === colour.toLowerCase() ? 'selected' : ''} style={{ '--picker-colour': colour }} onClick={() => { applyBoardColour(colour); setPaletteItem(null); setPaletteAnchor(null); }} aria-label={`Use ${colour}`} aria-pressed={activeColour.toLowerCase() === colour.toLowerCase()} />)}</div></section>}
  </section>;
}

function Collection({ folder, onBack, openItem, openItemModal, openEditModal, openDeleteModal }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const folderStyle = {
    '--folder-rgb': channels(folder.color),
    '--folder-dark-rgb': channels(folder.color, .62),
    '--folder-text': contrastingTextColor(folder.color),
  };
  const chooseMenuAction = (action) => { setMenuOpen(false); action(); };
  return <section className="screen collection-screen"><header className="topbar"><button className="round-btn" onClick={onBack} aria-label="Back to stashes"><BackArrow /></button><div className="collection-actions"><button className="btn btn-orange primary-action" onClick={openItemModal}><span className="button-plus" aria-hidden="true">+</span>Add Item</button><div className="stash-menu"><button className="kebab-btn" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Stash options" aria-expanded={menuOpen}>⋮</button>{menuOpen && <div className="stash-menu-panel" role="menu"><p>Stash options</p><button type="button" role="menuitem" onClick={() => chooseMenuAction(openEditModal)}>Edit</button><button type="button" role="menuitem" className="stash-menu-delete" onClick={() => chooseMenuAction(openDeleteModal)}>Delete</button></div>}</div></div></header><div className="collection-heading"><span className="collection-folder-icon" aria-hidden="true">{folder.icon}</span><div><h2>{folder.name}</h2><p className="collection-count">{folder.items.length} {folder.items.length === 1 ? 'item' : 'items'}</p></div></div><div className="collection-folder" style={folderStyle}><svg className="collection-folder__waves" viewBox="0 0 160 24" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 7 C20 2 38 11 58 6 C80 1 102 11 124 6 C143 2 152 7 160 4 V24 H0 Z" /></svg><div className="collection-folder__scroll"><div className="collection-item-grid">{folder.items.length ? folder.items.map((item) => <button key={item.id} className="item-card" onClick={() => openItem(folder.id, item.id)}><img src={item.src} alt={item.name} /><strong>{item.name}</strong><small>{item.material}</small></button>) : <p className="empty">This stash is ready for its first find.</p>}</div></div></div></section>;
}

function Detail({ folder, item, onBack, openEditItemModal, openDeleteItemModal }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const chooseMenuAction = (action) => { setMenuOpen(false); action(); };
  return <section className="screen detail-screen"><header className="topbar"><button className="round-btn" onClick={onBack} aria-label="Back to collection"><BackArrow /></button><div className="stash-menu"><button className="kebab-btn" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Item options" aria-expanded={menuOpen}>⋮</button>{menuOpen && <div className="stash-menu-panel" role="menu"><p>Item options</p><button type="button" role="menuitem" onClick={() => chooseMenuAction(openEditItemModal)}>Edit</button><button type="button" role="menuitem" className="stash-menu-delete" onClick={() => chooseMenuAction(openDeleteItemModal)}>Delete</button></div>}</div></header><div className="detail-image"><img src={item.src} alt={item.name} /></div><div className="detail-copy"><h2>{item.name}</h2>{item.material && <div className="detail-meta"><span>Category: Packaging</span><span>Material: {item.material}</span></div>}{item.notes && <p className="notes">{item.notes}</p>}{item.colors?.length > 0 && <div className="colour-row">{item.colors.map((color) => <span key={color} className={isLightColor(color) ? 'light-colour' : ''} style={{ '--chip': color, '--chip-text': contrastingTextColor(color) }} title={color}>{color}</span>)}</div>}<button className="detail-stash" type="button" onClick={onBack}><span>{folder.icon}</span>{folder.name}</button></div></section>;
}

function FolderModal({ close, createFolder, folder, updateFolder }) {
  const [color, setColor] = useState(folder?.color || '#D00000');
  const [icon, setIcon] = useState(folder?.icon || '🍔');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const isEditing = Boolean(folder);
  const colors = folderColors.map((value, index) => ({ value, preview: folderPickerColors[index] }));
  const emojis = ['🍔', '🍎', '🧸', '🌅', '🔑', '💌', '🪴', '🚗', '✈️', '📦', '🎀', '⭐', '💡', '😊', '👻', '👾', '📸', '❤️'];
  const submit = (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const details = { name: form.get('name').trim(), description: form.get('description').trim(), color, icon }; if (isEditing) updateFolder(folder.id, details); else createFolder(details); };
  return <div className="overlay"><form className="modal folder-modal" onSubmit={submit}><button className="close" type="button" onClick={close} aria-label="Close">×</button><h2>{isEditing ? 'Edit Stash' : 'Create Stash'}</h2><div className="folder-preview"><FolderArt folder={{ color, icon, items: [] }} /></div><label><span className="field-label">Stash name <span className="required-marker" aria-hidden="true">*</span></span><div className="stash-name-fields"><input className="field" name="name" required maxLength="42" placeholder="e.g. Retro packaging" defaultValue={folder?.name} autoFocus /><div className="emoji-control"><button className="emoji-button" type="button" onClick={() => setEmojiPickerOpen((open) => !open)} aria-label="Choose a stash emoji" aria-expanded={emojiPickerOpen} aria-controls="stash-emoji-picker">{icon}</button>{emojiPickerOpen && <div id="stash-emoji-picker" className="emoji-picker-popover" role="listbox" aria-label="Choose a stash emoji">{emojis.map((emoji) => <button key={emoji} type="button" role="option" aria-selected={icon === emoji} onClick={() => { setIcon(emoji); setEmojiPickerOpen(false); }}>{emoji}</button>)}</div>}</div></div></label><label>Description<input className="field" name="description" maxLength="80" placeholder="Graphic design inspo" defaultValue={folder?.description} /></label><div className="folder-picker"><p>Colour</p><div className="swatches">{colors.map((swatch) => <button key={swatch.value} type="button" className={`swatch ${color === swatch.value ? 'selected' : ''}`} style={{ '--swatch': swatch.preview }} onClick={() => setColor(swatch.value)} aria-label={`Select ${swatch.value}`} />)}</div></div><button className={`btn btn-orange ${isEditing ? 'btn-full' : 'primary-action'}`}>{isEditing ? 'Save Changes' : 'Create'}</button></form></div>;
}

function DeleteFolderModal({ folder, close, deleteFolder }) {
  const itemCopy = folder.items.length === 1 ? '1 item' : `${folder.items.length} items`;
  return <div className="overlay" role="presentation"><section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-stash-title"><button className="close" type="button" onClick={close} aria-label="Close">×</button><h2 id="delete-stash-title">Delete stash?</h2><p><strong>{folder.name}</strong> and its {itemCopy} will be permanently removed.</p><div className="confirm-actions"><button className="btn btn-quiet" type="button" onClick={close}>Keep Stash</button><button className="btn btn-danger" type="button" onClick={() => deleteFolder(folder.id)}>Delete Stash</button></div></section></div>;
}

function ItemEditModal({ item, folder, folders, close, updateItem }) {
  const [colors, setColors] = useState(item.colors || []);
  const [selectedColor, setSelectedColor] = useState('');
  const [destinationFolderId, setDestinationFolderId] = useState(folder.id);
  const applyColor = (value, slotIndex = null) => {
    const color = value.toUpperCase();
    setSelectedColor(Number.isInteger(slotIndex) ? color : '');
    setColors((current) => {
      if (Number.isInteger(slotIndex) && current[slotIndex]) { const next = [...current]; next[slotIndex] = color; return next; }
      return current.includes(color) || current.length >= 3 ? current : [...current, color];
    });
  };
  const pickColor = async () => {
    const slotIndex = selectedColor && colors.includes(selectedColor) ? colors.indexOf(selectedColor) : null;
    if (!('EyeDropper' in window)) return;
    try { const { sRGBHex } = await new window.EyeDropper().open(); applyColor(sRGBHex, slotIndex); } catch {}
  };
  const removeColor = (color) => { setColors((current) => current.filter((entry) => entry !== color)); setSelectedColor(''); };
  const submit = (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); updateItem(destinationFolderId, item.id, { name: form.get('name').trim(), material: form.get('material').trim(), notes: form.get('notes').trim(), colors }); };
  return <div className="overlay"><form className="modal item-modal item-edit-modal" onSubmit={submit}><button className="close" type="button" onClick={close} aria-label="Close">×</button><h2>Edit item</h2><section className="item-step"><img className="details-thumbnail" src={item.src} alt="Item thumbnail" /><div className="details-primary-fields"><label><span className="field-label">Item name <span className="required-marker" aria-hidden="true">*</span></span><input className="field" name="name" required maxLength="60" defaultValue={item.name} autoFocus /></label><label>Material<input className="field" name="material" maxLength="60" defaultValue={item.material} /></label></div><label>Notes<textarea className="field textarea" name="notes" maxLength="250" defaultValue={item.notes} /></label><div className="colour-picker" aria-label="Item colours"><button className="eyedropper-btn" type="button" onClick={pickColor} disabled={!selectedColor && colors.length >= 3} aria-label={selectedColor ? `Change ${selectedColor}` : 'Add a colour from the item'} title={selectedColor ? `Change ${selectedColor}` : 'Add a colour from the item'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 3.3 6 6-3 3-1.5-1.5-6.7 6.7-2.4.6.6-2.4 6.7-6.7-1.5-1.5 2.8-2.8ZM5.7 17.3l1 1-2.9 2.9a2 2 0 0 1-2.8-2.8l2.9-2.9 1 1 .8-.8Z" /></svg></button><div className="item-colours">{Array.from({ length: 3 }, (_, index) => { const color = colors[index]; const tone = color ? swatchTone(color) : ''; return color ? <button type="button" key={color} className={`item-colour-chip ${tone} ${selectedColor === color ? 'selected' : ''}`} style={{ '--chip': color, '--chip-text': contrastingTextColor(color) }} onClick={() => setSelectedColor((current) => current === color ? '' : color)} aria-pressed={selectedColor === color} aria-label={`${selectedColor === color ? 'Unselect' : 'Select'} ${color}`}><span>{color}</span><span className="swatch-remove" role="button" tabIndex="0" aria-label={`Delete ${color}`} onClick={(event) => { event.stopPropagation(); removeColor(color); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); removeColor(color); } }}>×</span></button> : <span key={`colour-slot-${index}`} className="item-colour-chip empty">Colour {index + 1}</span>; })}</div></div><label className="folder-select"><span>Choose Stash</span><select value={destinationFolderId} onChange={(event) => setDestinationFolderId(event.target.value)}>{folders.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.icon} {candidate.name}</option>)}</select></label><div className="step-actions"><button className="btn btn-quiet" type="button" onClick={close}>Back</button><button className="btn btn-orange" type="submit">Save Changes</button></div></section></form></div>;
}

function DeleteItemModal({ item, close, deleteItem }) {
  return <div className="overlay" role="presentation"><section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-item-title"><button className="close" type="button" onClick={close} aria-label="Close">×</button><h2 id="delete-item-title">Delete item?</h2><p><strong>{item.name}</strong> will be permanently removed from this stash.</p><div className="confirm-actions"><button className="btn btn-quiet" type="button" onClick={close}>Keep Item</button><button className="btn btn-danger" type="button" onClick={() => deleteItem(item.id)}>Delete Item</button></div></section></div>;
}

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('The image could not be read.'));
  reader.readAsDataURL(file);
});

const drawImageOnCanvas = (canvas, src, isCurrent = () => true) => new Promise((resolve, reject) => {
  const newImg = new Image();
  newImg.onload = () => {
    if (!isCurrent()) { resolve(); return; }
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(newImg, 0, 0, canvas.width, canvas.height);
    resolve();
  };
  newImg.onerror = () => reject(new Error('The image preview could not be created.'));
  newImg.src = src;
});

const paintCrop = (canvas, src, zoom, rotation, position, isCurrent = () => true) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    if (!isCurrent()) { resolve(null); return; }
    const size = 640;
    const context = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    const radians = rotation * Math.PI / 180;
    const rotationCover = Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians));
    const coverScale = Math.max(size / image.naturalWidth, size / image.naturalHeight) * rotationCover;
    const scale = coverScale * zoom;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
    const rotatedHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
    const maxX = Math.max(0, (rotatedWidth - size) / 2);
    const maxY = Math.max(0, (rotatedHeight - size) / 2);
    const x = Math.max(-maxX, Math.min(maxX, position.x));
    const y = Math.max(-maxY, Math.min(maxY, position.y));
    context.clearRect(0, 0, size, size);
    context.save();
    context.translate(size / 2 + x, size / 2 + y);
    context.rotate(radians);
    context.drawImage(image, -width / 2, -height / 2, width, height);
    context.restore();
    resolve({ x, y, maxX, maxY });
  };
  image.onerror = () => reject(new Error('The image preview could not be created.'));
  image.src = src;
});

function ItemModal({ folder, folders, isFolderSpecific, close, createItem }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [source, setSource] = useState('');
  const [prepared, setPrepared] = useState('');
  const [processed, setProcessed] = useState('');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [isPositioning, setIsPositioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalCopy, setRemovalCopy] = useState({ title: 'Removing background...', detail: 'Finding the edge of your item' });
  const [step2CanvasReady, setStep2CanvasReady] = useState(false);
  const [brushFallback, setBrushFallback] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [details, setDetails] = useState({ name: '', material: '', notes: '' });
  const [destinationFolderId, setDestinationFolderId] = useState(folder?.id || folders[0]?.id || '');
  const [sampling, setSampling] = useState(false);
  const [samplingSlot, setSamplingSlot] = useState(null);
  const [samplingPosition, setSamplingPosition] = useState({ x: 0.5, y: 0.5 });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoRemoveRef = useRef(false);
  const autoRemoveRunRef = useRef(0);
  const removalRunRef = useRef(0);
  const removalAbortRef = useRef(null);
  const removalTimerRef = useRef(null);
  const removalStartedAtRef = useRef(0);
  const canvasSizeRef = useRef({ width: 640, height: 640 });
  const brushPointRef = useRef(null);
  const brushingRef = useRef(false);
  const cropDragRef = useRef(null);
  const cropBoundsRef = useRef({ maxX: 0, maxY: 0 });
  const samplingImageRef = useRef(null);
  const samplingDragRef = useRef(false);
  const canvasImage = processed || prepared;

  useEffect(() => {
    const eyedropper = document.querySelector('.sampling-eyedropper');
    if (!eyedropper) return;
    eyedropper.style.left = `${samplingPosition.x * 100}%`;
    eyedropper.style.top = `${samplingPosition.y * 100}%`;
    eyedropper.style.backgroundImage = `url(${processed})`;
    eyedropper.style.backgroundPosition = `${samplingPosition.x * 100}% ${samplingPosition.y * 100}%`;
  }, [processed, sampling, samplingPosition]);

  useEffect(() => {
    if (!canvasRef.current || step === 3) return;
    let current = true;
    if (step === 1 && source) {
      paintCrop(canvasRef.current, source, cropZoom, cropRotation, cropPosition, () => current).then((crop) => {
        if (!crop) return;
        const { x, y, maxX, maxY } = crop;
        cropBoundsRef.current = { maxX, maxY };
        if (x !== cropPosition.x || y !== cropPosition.y) setCropPosition({ x, y });
      }).catch((error) => setRemoveError(error.message));
    } else if (step === 2 && canvasImage) {
      drawImageOnCanvas(canvasRef.current, canvasImage, () => current).then(() => {
        if (current) setStep2CanvasReady(true);
      }).catch((error) => setRemoveError(error.message));
    }
    return () => { current = false; };
  }, [canvasImage, cropPosition, cropRotation, cropZoom, source, step]);

  const acceptFile = async (nextFile) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) {
      setRemoveError('Choose a PNG, JPG, WEBP, or another image file.');
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(nextFile);
      setFile(nextFile);
      setSource(dataUrl);
      setPrepared('');
      setProcessed('');
      setCropZoom(1);
      setCropRotation(0);
      setCropPosition({ x: 0, y: 0 });
      setBrushFallback(false);
      setRemoveError('');
      setDetails({ name: '', material: '', notes: '' });
      setColors([]);
      setSelectedColor('');
      setStep(1);
    } catch (error) {
      setRemoveError(error.message);
    }
  };

  const upload = (event) => acceptFile(event.target.files?.[0]);
  const drop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const beginPositioning = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    cropDragRef.current = { x: event.clientX, y: event.clientY, origin: cropPosition };
    setIsPositioning(true);
  };

  const positionCrop = (event) => {
    if (!cropDragRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    const { maxX, maxY } = cropBoundsRef.current;
    const nextX = cropDragRef.current.origin.x + (event.clientX - cropDragRef.current.x) * scale;
    const nextY = cropDragRef.current.origin.y + (event.clientY - cropDragRef.current.y) * scale;
    setCropPosition({
      x: Math.max(-maxX, Math.min(maxX, nextX)),
      y: Math.max(-maxY, Math.min(maxY, nextY)),
    });
  };

  const finishPositioning = () => {
    cropDragRef.current = null;
    setIsPositioning(false);
  };

  const cancelRemoval = () => {
    removalRunRef.current += 1;
    autoRemoveRef.current = false;
    removalAbortRef.current?.abort();
    removalAbortRef.current = null;
    window.clearTimeout(removalTimerRef.current);
    removalTimerRef.current = null;
    setIsRemoving(false);
  };

  const advanceToRemoval = () => {
    canvasSizeRef.current = { width: canvasRef.current.width, height: canvasRef.current.height };
    setPrepared(canvasRef.current.toDataURL('image/png'));
    setProcessed('');
    setStep2CanvasReady(false);
    setBrushFallback(false);
    setRemoveError('');
    setRemovalCopy({ title: 'Removing background...', detail: 'Finding the edge of your item' });
    setIsRemoving(true);
    removalStartedAtRef.current = Date.now();
    autoRemoveRunRef.current = ++removalRunRef.current;
    autoRemoveRef.current = true;
    setStep(2);
  };

  const returnToPhotoUpload = () => {
    setFile(null);
    setSource('');
    setPrepared('');
    setProcessed('');
    setCropZoom(1);
    setCropRotation(0);
    setCropPosition({ x: 0, y: 0 });
    setBrushFallback(false);
    setRemoveError('');
  };

  const removeBackground = async (imageBlob, runId) => {
    if (!imageBlob || runId !== removalRunRef.current) return;
    const isCurrentRun = () => runId === removalRunRef.current;
    const abortController = new AbortController();
    removalAbortRef.current = abortController;
    setIsRemoving(true);
    setBrushFallback(false);
    setRemoveError('');
    setRemovalCopy({ title: 'Removing background...', detail: 'Finding the edge of your item' });
    const showAlmostThere = () => {
      if (isCurrentRun() && Date.now() - removalStartedAtRef.current >= 650) setRemovalCopy({ title: 'Almost there...', detail: 'Polishing the final edge' });
    };
    removalTimerRef.current = window.setTimeout(() => {
      showAlmostThere();
    }, 1100);
    try {
      let result;
      const endpoint = import.meta.env.VITE_BG_REMOVAL_ENDPOINT;
      if (endpoint) {
        const body = new FormData();
        body.append('image', imageBlob, `${file?.name.replace(/\.[^.]+$/, '') || 'stash-item'}-square.png`);
        body.append('size', 'full');
        body.append('crop', 'false');
        const response = await fetch(endpoint, { method: 'POST', body, signal: abortController.signal });
        if (!response.ok) throw new Error(`Background removal failed (${response.status}).`);
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          result = data.image || data.result || data.url;
          if (!result) throw new Error('The background-removal response did not include an image.');
        } else {
          result = await readAsDataUrl(await response.blob());
        }
      } else {
        const transparentBlob = await imglyRemoveBackground(imageBlob, {
          device: 'cpu',
          model: 'isnet_quint8',
          output: { format: 'image/png', quality: 1, type: 'foreground' },
          fetchArgs: { signal: abortController.signal },
          progress: (stage, current, total) => {
            if (stage.includes('mask') || stage.includes('encode') || current / total >= 0.75) showAlmostThere();
          },
        });
        result = await readAsDataUrl(transparentBlob);
      }
      if (!isCurrentRun()) return;
      await drawImageOnCanvas(canvasRef.current, result);
      if (!isCurrentRun()) return;
      setProcessed(result);
      window.clearTimeout(removalTimerRef.current);
      const remainingStartCopyTime = Math.max(0, 650 - (Date.now() - removalStartedAtRef.current));
      if (remainingStartCopyTime) await new Promise((resolve) => window.setTimeout(resolve, remainingStartCopyTime));
      if (!isCurrentRun()) return;
      setRemovalCopy({ title: 'Successfully cropped', detail: 'Your cutout is ready' });
      await new Promise((resolve) => window.setTimeout(resolve, 650));
    } catch (error) {
      if (!isCurrentRun() || error.name === 'AbortError') return;
      window.clearTimeout(removalTimerRef.current);
      setRemoveError('Background removal failed (404). Try again or use the refine brush.');
      setBrushFallback(true);
    } finally {
      if (isCurrentRun()) {
        window.clearTimeout(removalTimerRef.current);
        removalTimerRef.current = null;
        removalAbortRef.current = null;
        setIsRemoving(false);
      }
    }
  };

  useEffect(() => {
    if (!autoRemoveRef.current || step !== 2 || !prepared || !step2CanvasReady) return;
    autoRemoveRef.current = false;
    const runId = autoRemoveRunRef.current;
    void (async () => {
      try {
        const imageBlob = await (await fetch(prepared)).blob();
        await removeBackground(imageBlob, runId);
      } catch {
        if (runId !== removalRunRef.current) return;
        setRemoveError('Background removal failed (404). Try again or use the refine brush.');
        setBrushFallback(true);
        setIsRemoving(false);
      }
    })();
  }, [prepared, step, step2CanvasReady]);

  const eraseFallback = (event) => {
    if (!brushFallback || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
    const previous = brushPointRef.current || point;
    const context = canvas.getContext('2d');
    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 42 * canvas.width / rect.width;
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    context.restore();
    brushPointRef.current = point;
  };

  const beginFallbackBrush = (event) => {
    if (!brushFallback) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    brushingRef.current = true;
    brushPointRef.current = null;
    eraseFallback(event);
  };

  const finishFallbackBrush = () => {
    if (!brushingRef.current) return;
    brushingRef.current = false;
    brushPointRef.current = null;
    setProcessed(canvasRef.current.toDataURL('image/png'));
  };

  const useCanvasImage = () => {
    setStep(3);
  };

  const applyColor = (value, slotIndex = null) => {
    const colour = value.toUpperCase();
    setSelectedColor(Number.isInteger(slotIndex) ? colour : '');
    setColors((current) => {
      if (Number.isInteger(slotIndex) && current[slotIndex]) {
        const next = [...current];
        next[slotIndex] = colour;
        return next;
      }
      return current.includes(colour) || current.length >= 3 ? current : [...current, colour];
    });
  };
  const pickColor = async () => {
    const slotIndex = selectedColor && colors.includes(selectedColor) ? colors.indexOf(selectedColor) : null;
    const useNativePicker = 'EyeDropper' in window && !window.matchMedia('(pointer: coarse)').matches;
    if (useNativePicker) {
      try { const { sRGBHex } = await new window.EyeDropper().open(); applyColor(sRGBHex, slotIndex); } catch {}
    } else {
      setSamplingSlot(slotIndex);
      setSamplingPosition({ x: 0.5, y: 0.5 });
      setSampling(true);
    }
  };
  const sampleAtPosition = (position) => {
    const image = samplingImageRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(position.x * canvas.width)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(position.y * canvas.height)));
    const [red, green, blue] = context.getImageData(x, y, 1, 1).data;
    applyColor(`#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`, samplingSlot);
    setSampling(false);
    setSamplingSlot(null);
  };
  const moveSamplingEyedropper = (event) => {
    const image = samplingImageRef.current;
    if (!image) return null;
    const rect = image.getBoundingClientRect();
    const position = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
    setSamplingPosition(position);
    return position;
  };
  const beginSamplingEyedropper = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    samplingDragRef.current = true;
    moveSamplingEyedropper(event);
  };
  const finishSamplingEyedropper = (event) => {
    if (!samplingDragRef.current) return;
    samplingDragRef.current = false;
    sampleAtPosition(moveSamplingEyedropper(event) || samplingPosition);
  };
  const removeColor = (color) => {
    setColors((current) => current.filter((entry) => entry !== color));
    setSelectedColor('');
  };
  const submit = (event) => {
    event.preventDefault();
    if (!processed) return;
    createItem(destinationFolderId, { name: details.name.trim(), material: details.material.trim(), notes: details.notes.trim(), src: processed, colors });
  };

  return <div className="overlay"><form className="modal item-modal" onSubmit={submit}>
    <button className="close" type="button" onClick={() => { cancelRemoval(); close(); }} aria-label="Close">×</button>
    <h2>Add Item</h2>
    {isFolderSpecific && destinationFolderId === folder.id && <p className="modal-subtitle">Saving to <strong>{folder.name}</strong></p>}
    <ol className="item-stepper" aria-label="Add item steps">{['Photo', 'Remove background', 'Details'].map((label, index) => <li key={label} className={`${step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} ${isRemoving && index === 1 ? 'loading' : ''}`}><span>{index + 1}</span>{label}</li>)}</ol>

    {step === 1 && <section className="item-step">
      {!source && <div className={`upload-zone ${isDragging ? 'dragging' : ''}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={drop}>
        <strong>{isDragging ? 'Drop it here' : 'Drop or upload your photo here'}</strong>
        <span className="upload-tip">(Best with plain background)</span>
        <input className="file-input" ref={fileInputRef} type="file" onChange={upload} accept="image/*" tabIndex="-1" aria-hidden="true" />
        <button className="upload-file-button" type="button" onClick={() => fileInputRef.current?.click()}>Choose file</button>
      </div>}
      {source && <div className="crop-workspace">
        <div className="crop-canvas-wrap">
          <canvas className={`preview-canvas ${isPositioning ? 'is-positioning' : ''}`} ref={canvasRef} role="img" aria-label="Square image crop. Drag to reposition." onPointerDown={beginPositioning} onPointerMove={positionCrop} onPointerUp={finishPositioning} onPointerCancel={finishPositioning} />
          <span className="crop-hint">Drag to position</span>
        </div>
        <label className="image-adjust-control"><span>Zoom <output>{Math.round(cropZoom * 100)}%</output></span><div className="image-adjust-range" style={{ '--range-fill': `${(cropZoom - 0.5) * 100}%` }}><input type="range" min="0.5" max="1.5" step="0.01" value={cropZoom} onChange={(event) => { const zoom = Number(event.target.value); setCropZoom(Math.abs(zoom - 1) < 0.05 ? 1 : zoom); }} aria-label="Zoom image" /><i aria-hidden="true" /></div></label>
        <label className="image-adjust-control"><span>Rotate <output>{cropRotation}°</output></span><div className="image-adjust-range" style={{ '--range-fill': `${(cropRotation + 180) / 3.6}%` }}><input type="range" min="-180" max="180" step="1" value={cropRotation} onChange={(event) => { const rotation = Number(event.target.value); setCropRotation(Math.abs(rotation) < 4 ? 0 : rotation); }} aria-label="Rotate image" /><i aria-hidden="true" /></div></label>
        <button className="reset-crop" type="button" onClick={() => { setCropZoom(1); setCropRotation(0); setCropPosition({ x: 0, y: 0 }); }}>Reset position</button>
      </div>}
      {removeError && <p className="step-error" role="alert">{removeError}</p>}
      {source ? <div className="step-actions"><button className="btn btn-quiet" type="button" onClick={returnToPhotoUpload}>Back</button><button className="btn btn-orange" type="button" onClick={advanceToRemoval}>Next</button></div> : <button className="btn btn-orange btn-full" type="button" disabled onClick={advanceToRemoval}>Next</button>}
    </section>}

    {step === 2 && <section className="item-step">
      <div className="image-workspace">
        <div className="canvas-wrap">
          <canvas className={`eraser-canvas ${brushFallback ? 'is-fallback' : ''}`} ref={canvasRef} width={canvasSizeRef.current.width} height={canvasSizeRef.current.height} role="img" aria-label={brushFallback ? 'Refine brush canvas. Drag to erase the background.' : 'Background removal preview'} onPointerDown={beginFallbackBrush} onPointerMove={(event) => brushingRef.current && eraseFallback(event)} onPointerUp={finishFallbackBrush} onPointerCancel={finishFallbackBrush} />
          {isRemoving && <div className={`canvas-loading ${removalCopy.title === 'Successfully cropped' ? 'is-success' : ''}`} role="status" aria-live="polite">{removalCopy.title === 'Successfully cropped' ? <span className="success-mark" aria-hidden="true">✓</span> : <span className="spinner" />}<strong>{removalCopy.title}</strong><small>{removalCopy.detail}</small></div>}
        </div>
      </div>
      {removeError && <p className="step-error" role="alert">{removeError}</p>}
      <div className="step-actions"><button className="btn btn-quiet" type="button" onClick={() => { cancelRemoval(); setStep(1); }}>Back</button><button className="btn btn-orange" type="button" disabled={!processed || isRemoving} onClick={useCanvasImage}>Next</button></div>
    </section>}

    {step === 3 && <section className="item-step"><div className={`colour-sampling-preview ${sampling ? 'is-sampling' : ''}`}><img ref={samplingImageRef} className="details-thumbnail" src={processed} alt="Prepared item thumbnail" />{sampling && <button className="sampling-eyedropper" type="button" style={{ '--sample-x': samplingPosition.x, '--sample-y': samplingPosition.y }} onPointerDown={beginSamplingEyedropper} onPointerMove={(event) => samplingDragRef.current && moveSamplingEyedropper(event)} onPointerUp={finishSamplingEyedropper} onPointerCancel={() => { samplingDragRef.current = false; }} aria-label="Drag to a colour, then release to sample it"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 3.3 6 6-3 3-1.5-1.5-6.7 6.7-2.4.6.6-2.4 6.7-6.7-1.5-1.5 2.8-2.8ZM5.7 17.3l1 1-2.9 2.9a2 2 0 0 1-2.8-2.8l2.9-2.9 1 1 .8-.8Z" /></svg></button>}</div><div className="details-primary-fields"><label><span className="field-label">Item name <span className="required-marker" aria-hidden="true">*</span></span><input className="field" name="name" required maxLength="60" placeholder="e.g. Colourful Poster" value={details.name} onChange={(event) => setDetails((current) => ({ ...current, name: event.target.value }))} autoFocus /></label><label>Material<input className="field" name="material" maxLength="60" placeholder="e.g. Plastic, paper" value={details.material} onChange={(event) => setDetails((current) => ({ ...current, material: event.target.value }))} /></label></div><label>Notes<textarea className="field textarea" name="notes" maxLength="250" placeholder="What catches your eye?" value={details.notes} onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))} /></label><div className="colour-picker" aria-label="Item colours"><button className="eyedropper-btn" type="button" onClick={pickColor} disabled={!selectedColor && colors.length >= 3} aria-label={selectedColor ? `Change ${selectedColor}` : 'Add a colour from the item'} title={selectedColor ? `Change ${selectedColor}` : 'Add a colour from the item'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 3.3 6 6-3 3-1.5-1.5-6.7 6.7-2.4.6.6-2.4 6.7-6.7-1.5-1.5 2.8-2.8ZM5.7 17.3l1 1-2.9 2.9a2 2 0 0 1-2.8-2.8l2.9-2.9 1 1 .8-.8Z" /></svg></button><div className="item-colours">{Array.from({ length: 3 }, (_, index) => { const color = colors[index]; const tone = color ? swatchTone(color) : ''; return color ? <button type="button" key={color} className={`item-colour-chip ${tone} ${selectedColor === color ? 'selected' : ''}`} style={{ '--chip': color, '--chip-text': contrastingTextColor(color) }} onClick={() => setSelectedColor((current) => current === color ? '' : color)} aria-pressed={selectedColor === color} aria-label={`${selectedColor === color ? 'Unselect' : 'Select'} ${color}`}><span>{color}</span><span className="swatch-remove" role="button" tabIndex="0" aria-label={`Delete ${color}`} onClick={(event) => { event.stopPropagation(); removeColor(color); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); removeColor(color); } }}>×</span></button> : <span key={`colour-slot-${index}`} className="item-colour-chip empty">Colour {index + 1}</span>; })}</div></div><label className="folder-select"><span>Choose Stash</span><select value={destinationFolderId} onChange={(event) => setDestinationFolderId(event.target.value)}>{folders.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.icon} {candidate.name}</option>)}</select></label>{sampling && <p className="colour-sampling-help">Drag the eyedropper over the item, then lift your finger to sample.</p>}<div className="step-actions"><button className="btn btn-quiet" type="button" onClick={() => setStep(2)}>Back</button><button className="btn btn-orange" type="submit">Save Item</button></div></section>}
  </form></div>;
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  // A visit is intentionally a fresh session: the public link always opens
  // at the landing page and the library is empty until the visitor adds to it.
  const [folders, setFolders] = useState([]);
  const [moodboards, setMoodboards] = useState([]);
  const [page, setPage] = useState('home'); const [folderId, setFolderId] = useState(''); const [itemId, setItemId] = useState(''); const [moodboardId, setMoodboardId] = useState(''); const [search, setSearch] = useState(''); const [modal, setModal] = useState(''); const [itemFolderSpecific, setItemFolderSpecific] = useState(false);
  const folder = findFolder(folders, folderId) || folders[0]; const item = folder?.items.find((entry) => entry.id === itemId) || folder?.items[0];
  const openFolder = (id) => { setFolderId(id); setSearch(''); setPage('collection'); };
  const openItem = (nextFolderId, nextItemId) => { setFolderId(nextFolderId); setItemId(nextItemId); setSearch(''); setPage('detail'); };
  const createFolder = ({ name, description, color, icon }) => { const entry = { id: `folder-${Date.now()}`, name, description, color, icon, items: [] }; setFolders((current) => [...current, entry]); setFolderId(entry.id); setModal(''); setPage('collection'); };
  const updateFolder = (id, details) => { setFolders((current) => current.map((candidate) => candidate.id === id ? { ...candidate, ...details } : candidate)); setModal(''); };
  const openItemModal = (isFolderSpecific) => { setItemFolderSpecific(isFolderSpecific); setModal('item'); };
  const createItem = (destinationFolderId, entry) => { const withId = { ...entry, id: `item-${Date.now()}` }; setFolders((current) => current.map((candidate) => candidate.id === destinationFolderId ? { ...candidate, items: [withId, ...candidate.items] } : candidate)); setFolderId(destinationFolderId); setItemId(withId.id); setModal(''); setPage('detail'); };
  const updateItem = (destinationFolderId, id, details) => {
    const updatedItem = { ...item, ...details };
    setFolders((current) => current.map((candidate) => {
      if (candidate.id === folder.id && candidate.id === destinationFolderId) return { ...candidate, items: candidate.items.map((entry) => entry.id === id ? updatedItem : entry) };
      if (candidate.id === folder.id) return { ...candidate, items: candidate.items.filter((entry) => entry.id !== id) };
      if (candidate.id === destinationFolderId) return { ...candidate, items: [updatedItem, ...candidate.items] };
      return candidate;
    }));
    setFolderId(destinationFolderId);
    setItemId(id);
    setModal('');
  };
  const deleteFolder = (id) => { setFolders((current) => current.filter((candidate) => candidate.id !== id)); setModal(''); setSearch(''); setPage('home'); };
  const deleteItem = (id) => { setFolders((current) => current.map((candidate) => candidate.id === folder.id ? { ...candidate, items: candidate.items.filter((entry) => entry.id !== id) } : candidate)); setModal(''); setPage('collection'); };
  const moodboard = moodboards.find((entry) => entry.id === moodboardId);
  const openMoodboard = (id) => { setMoodboardId(id); setSearch(''); setPage('moodboard'); };
  const renameMoodboard = (name) => { setMoodboards((current) => current.map((entry) => entry.id === moodboardId ? { ...entry, name } : entry)); };
  const updateMoodboardCanvas = useCallback((canvas) => {
    setMoodboards((current) => current.map((entry) => entry.id === moodboardId ? { ...entry, canvas } : entry));
  }, [moodboardId]);
  const deleteMoodboard = (id) => { setMoodboards((current) => current.filter((entry) => entry.id !== id)); };
  const createMoodboard = () => {
    const entry = { id: `moodboard-${Date.now()}`, name: `Moodboard ${moodboards.length + 1}` };
    setMoodboards((current) => [...current, entry]);
    openMoodboard(entry.id);
  };
  const changeMode = (mode) => { setSearch(''); setPage(mode === 'moodboard' ? 'moodboard-library' : 'home'); };
  if (!hasEntered) return <Landing onEnter={() => setHasEntered(true)} />;
  return <><GridWarpFilter />{page === 'moodboard' && moodboard ? <Moodboard folders={folders} moodboard={moodboard} onRename={renameMoodboard} onCanvasChange={updateMoodboardCanvas} onBack={() => changeMode('moodboard')} /> : page === 'moodboard-library' ? <MoodboardLibrary moodboards={moodboards} search={search} setSearch={setSearch} createMoodboard={createMoodboard} openMoodboard={openMoodboard} deleteMoodboard={deleteMoodboard} onModeChange={changeMode} /> : page === 'collection' ? <Collection folder={folder} onBack={() => setPage('home')} openItem={openItem} openItemModal={() => openItemModal(true)} openEditModal={() => setModal('edit-folder')} openDeleteModal={() => setModal('delete-folder')} /> : page === 'detail' && item ? <Detail folder={folder} item={item} onBack={() => setPage('collection')} openEditItemModal={() => setModal('edit-item')} openDeleteItemModal={() => setModal('delete-item')} /> : <Home folders={folders} search={search} setSearch={setSearch} openFolder={openFolder} openItem={openItem} openFolderModal={() => setModal('folder')} openItemModal={() => openItemModal(false)} onModeChange={changeMode} />}{modal === 'folder' && <FolderModal close={() => setModal('')} createFolder={createFolder} />}{modal === 'edit-folder' && folder && <FolderModal close={() => setModal('')} folder={folder} updateFolder={updateFolder} />}{modal === 'item' && <ItemModal folder={folder} folders={folders} isFolderSpecific={itemFolderSpecific} close={() => setModal('')} createItem={createItem} />}{modal === 'edit-item' && item && <ItemEditModal item={item} folder={folder} folders={folders} close={() => setModal('')} updateItem={updateItem} />}{modal === 'delete-folder' && folder && <DeleteFolderModal folder={folder} close={() => setModal('')} deleteFolder={deleteFolder} />}{modal === 'delete-item' && item && <DeleteItemModal item={item} close={() => setModal('')} deleteItem={deleteItem} />}</>;
}
