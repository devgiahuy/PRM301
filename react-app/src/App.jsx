import { useEffect, useMemo, useState } from 'react'
import exams from './data.json'
import './App.css'

const KEY = 'prm-review-v1'
const THEME_KEY = 'prm-review-theme'
const letters = ['A', 'B', 'C', 'D']
function Icon({ name, size = 18, fill = 'none' }) {
 const paths = { grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>, star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>, wrong: <><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></>, check: <path d="m5 12 4 4L19 6"/>, arrow: <path d="m9 18 6-6-6-6"/>, book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6"/></>, search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></>, reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></> }
 return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
function load() { try { const data = JSON.parse(localStorage.getItem(KEY)); return data && typeof data === 'object' ? data : {} } catch { return {} } }
export default function App() {
 const [saved, setSaved] = useState(load)
 const [dark, setDark] = useState(() => { try { return localStorage.getItem(THEME_KEY) === 'dark' } catch { return false } })
 const [examId, setExamId] = useState(exams[0].id)
 const [view, setView] = useState('all')
 const [query, setQuery] = useState('')
 const [current, setCurrent] = useState(exams[0].questions[0].id)
 const [confirmReset, setConfirmReset] = useState(false)
 const [held, setHeld] = useState(null)
 const [storageError, setStorageError] = useState(false)
 const exam = exams.find(e => e.id === examId)
 const records = saved[examId] || {}
 useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(saved)); setStorageError(false) } catch { setStorageError(true) } }, [saved])
 useEffect(() => { try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light') } catch { /* Theme still applies for this session. */ } }, [dark])
 const items = useMemo(() => exam.questions.filter(q => { const r = records[q.id] || {}; const matches = view === 'all' || (view === 'unanswered' && !r.choice) || (view === 'star' && r.star) || (view === 'wrong' && r.choice && !q.ambiguous && r.choice !== q.answer); return matches && `${q.id} ${q.question} ${q.options.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()) }), [exam, records, view, query])
 const active = (held && exam.questions.find(q => q.id === held)) || items.find(q => q.id === current) || items[0]
 const rec = active ? records[active.id] || {} : {}
 const answered = exam.questions.filter(q => records[q.id]?.choice).length
 const wrong = exam.questions.filter(q => records[q.id]?.choice && !q.ambiguous && records[q.id].choice !== q.answer).length
 const starred = exam.questions.filter(q => records[q.id]?.star).length
 const index = active ? items.findIndex(q => q.id === active.id) : -1
 function update(id, patch) { setSaved(prev => ({ ...prev, [examId]: { ...(prev[examId] || {}), [id]: { ...(prev[examId]?.[id] || {}), ...patch } } })) }
 function changeExam(id) { setHeld(null); setExamId(id); setCurrent(exams.find(e => e.id === id).questions[0].id); setQuery(''); setView('all'); setConfirmReset(false) }
 function changeView(v) { setHeld(null); setView(v); setQuery('') }
 return <div className={'app-shell' + (dark ? ' dark-theme' : '')}>
  <aside className="sidebar">
   <div className="brand"><div className="brand-icon"><Icon name="book" size={21}/></div><div><strong>ôn tập.</strong><span>PRM393 / Flutter</span></div></div>
   <div className="side-label">KHÔNG GIAN HỌC</div>
   <nav aria-label="Bộ lọc câu hỏi" className="nav">
    <button className={view === 'all' ? 'active' : ''} onClick={() => changeView('all')}><Icon name="grid"/> Tất cả câu hỏi <span>{exam.questions.length}</span></button>
    <button className={view === 'unanswered' ? 'active' : ''} onClick={() => changeView('unanswered')}><Icon name="book"/> Chưa trả lời <span>{exam.questions.length - answered}</span></button>
    <button className={view === 'wrong' ? 'active' : ''} onClick={() => changeView('wrong')}><Icon name="wrong"/> Câu trả lời sai <span>{wrong}</span></button>
    <button className={view === 'star' ? 'active' : ''} onClick={() => changeView('star')}><Icon name="star"/> Câu đã đánh dấu <span>{starred}</span></button>
   </nav>
   <div className="side-bottom"><div className="side-progress"><div><span>Tiến độ bộ đề</span><strong>{answered}/{exam.questions.length}</strong></div><div className="progress-track"><div style={{width:`${answered / exam.questions.length * 100}%`}}/></div><small>Tiến độ được lưu trên trình duyệt này.</small></div><div className="side-foot">HỌC TỪNG CHÚT, NHỚ THẬT LÂU <span>✳</span></div></div>
  </aside>
  <main className="main">
   <header className="topbar"><div className="breadcrumb">Thư viện đề <span>/</span> <strong>{exam.title}</strong></div><div className="topbar-actions"><span className={storageError ? "local-badge storage-error" : "local-badge"} role="status"><span/> {storageError ? "Không thể lưu tiến độ" : "Lưu trên thiết bị"}</span><button type="button" className="theme-toggle" onClick={() => setDark(value => !value)} aria-pressed={dark} aria-label="Chế độ tối"><span aria-hidden="true">{dark ? '☀' : '☾'}</span><span>{dark ? 'Chế độ sáng' : 'Chế độ tối'}</span></button></div></header>
   <div className="content">
    <div className="heading"><div><h1>Góc ôn tập</h1><p>Mỗi câu hỏi là một bước gần hơn đến ngày thi.</p></div><div className="exam-select"><label htmlFor="exam">BỘ ĐỀ ĐANG HỌC</label><select id="exam" value={examId} onChange={e=>changeExam(e.target.value)}>{exams.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></div></div>
    <div className="summary"><div><span>Tiến độ</span><strong>{answered}<small> / {exam.questions.length} câu</small></strong></div><div><span>Cần xem lại</span><strong>{wrong}<small> câu sai</small></strong></div><div><span>Đã đánh dấu</span><strong>{starred}<small> câu hỏi</small></strong></div><p>Chọn một câu để bắt đầu<br/><b>hoặc tiếp tục nơi bạn muốn.</b></p></div>
    <div className="workspace"><section className="question-list" aria-label="Danh sách câu hỏi"><div className="list-head"><div><h2>{view === 'all' ? 'Danh sách câu hỏi' : view === 'unanswered' ? 'Câu chưa trả lời' : view === 'wrong' ? 'Câu trả lời sai' : 'Câu đã đánh dấu'}</h2><p>{items.length} câu hỏi</p></div></div><div className="search"><Icon name="search" size={17}/><input aria-label="Tìm câu hỏi" placeholder="Tìm câu hỏi..." value={query} onChange={e=>{setHeld(null);setQuery(e.target.value)}}/></div><div className="list-scroll">{items.length ? items.map(q=>{const r=records[q.id]||{};return <button key={q.id} className={'question-row '+(active?.id===q.id?'selected':'')} onClick={()=>{setHeld(null);setCurrent(q.id)}}><span className="row-num">{String(q.id).padStart(2,'0')}</span><span className="row-title">{q.question}</span><span className={'row-status '+(r.choice ? q.ambiguous ? 'unsure' : r.choice===q.answer ? 'correct':'incorrect' : '')}>{r.star ? <Icon name="star" size={14} fill="currentColor"/> : r.choice ? <Icon name={q.ambiguous?'book':r.choice===q.answer?'check':'wrong'} size={14}/> : null}</span></button>}) : <div className="empty">{query ? 'Không tìm thấy câu hỏi phù hợp.' : view === 'wrong' ? 'Chưa có câu trả lời sai. Tiếp tục luyện tập nhé!' : view === 'unanswered' ? 'Bạn đã trả lời hết các câu trong bộ đề này.' : 'Chưa có câu được đánh dấu sao.'}</div>}</div></section>
    <section className="study" aria-live="polite">{active ? <><div className="study-top"><div><span className="question-tag">CÂU {active.id} / {exam.questions.length}</span><span className="topic">FLUTTER & DART</span></div><button className={'star-button '+(rec.star?'is-starred':'')} onClick={()=>update(active.id,{star:!rec.star})} aria-label={rec.star?'Bỏ đánh dấu câu hỏi':'Đánh dấu câu hỏi'} aria-pressed={!!rec.star}><Icon name="star" size={19} fill={rec.star?'currentColor':'none'}/><span>{rec.star?'Đã đánh dấu':'Đánh dấu'}</span></button></div><h2 className="question-text">{active.question}</h2><p className="instruction">Chọn một đáp án bên dưới</p><div className="options">{active.options.map((option,i)=>{let letter=letters[i], chosen=rec.choice===letter, isAnswer=letter===active.answer; let cls=rec.choice&&!active.ambiguous?(isAnswer?'is-correct':chosen?'is-wrong':''):chosen?'is-chosen':'';return <button key={letter} className={'option '+cls} onClick={()=>{if((view === 'wrong' && letter === active.answer) || view === 'unanswered') setHeld(active.id); update(active.id,{choice:letter})}} aria-pressed={chosen}><span className="option-letter">{letter}</span><span>{option}</span>{rec.choice&&!active.ambiguous&&isAnswer&&<span className="option-result"><Icon name="check" size={17}/></span>}{rec.choice&&!active.ambiguous&&chosen&&!isAnswer&&<span className="option-result"><Icon name="wrong" size={17}/></span>}</button>})}</div>{rec.choice && <div className={'explanation '+(active.ambiguous?'note':rec.choice===active.answer?'success':'error')}><div className="explanation-title">{active.ambiguous?'Câu hỏi cần lưu ý':rec.choice===active.answer?'Chính xác!':'Chưa chính xác'} <span>{active.ambiguous?'Không tính đúng / sai':`Đáp án ${active.answer}`}</span></div><p>{active.explanation}</p>{active.ambiguous && <p>Câu này không được tính vào danh sách câu sai vì đề có phương án chưa rõ ràng.</p>}</div>}<div className="study-footer"><span>{held && index < 0 ? (view === 'wrong' ? 'Đã sửa câu sai' : 'Đã trả lời câu này') : `${index+1} / ${items.length} trong danh sách`}</span><div><button className="prev" disabled={index<=0} onClick={()=>{setHeld(null);setCurrent(items[index-1].id)}}>Trước</button><button className="next" disabled={!items.length || index>=items.length-1} onClick={()=>{setHeld(null);setCurrent(items[index+1].id)}}>Câu tiếp theo <Icon name="arrow" size={16}/></button></div></div></> : <div className="study-empty"><Icon name="book" size={30}/><h2>Chưa có câu hỏi ở đây</h2><p>Thử tìm từ khóa khác hoặc chọn một danh sách khác để tiếp tục học.</p><button onClick={()=>changeView('all')}>Xem tất cả câu hỏi</button></div>}</section></div>
    <div className="bottom-line"><span>{storageError ? "Trình duyệt không cho lưu dữ liệu. Tiến độ chỉ còn trong phiên này; hãy kiểm tra quyền lưu trữ của trình duyệt." : "Chọn đáp án khác để thử lại. Câu trả lời mới nhất sẽ được lưu."}</span>{!confirmReset ? <button onClick={()=>setConfirmReset(true)}><Icon name="reset" size={15}/> Xóa tiến độ bộ đề</button> : <div className="confirm"><span>Xóa câu trả lời và dấu sao của bộ đề này?</span><button onClick={()=>{setSaved(prev=>{const next={...prev};delete next[examId];return next});setHeld(null);setConfirmReset(false)}}>Xác nhận xóa</button><button onClick={()=>setConfirmReset(false)}>Hủy</button></div>}</div>
   </div>
  </main>
 </div>
}
