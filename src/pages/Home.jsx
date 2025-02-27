import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import "./home.scss";


export function Home() {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);

  useEffect(() => {
    axios.get(`${url}/lists`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      setLists(res.data)
    })
    .catch((err) => {
      setErrorMessage(`リストの取得に失敗しました。${err}`);
    })
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id
    if(typeof listId !== "undefined"){
      setSelectListId(listId)
      axios.get(`${url}/lists/${listId}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`
        }
      })
      .then((res) => {
        setTasks(res.data.tasks)
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      })
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios.get(`${url}/lists/${id}/tasks`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      setTasks(res.data.tasks)
    })
    .catch((err) => {
      setErrorMessage(`タスクの取得に失敗しました。${err}`);
    })
  }
  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p><Link to="/list/new">リスト新規作成</Link></p>
              <p><Link to={`/lists/${selectListId}/edit`}>選択中のリストを編集</Link></p>
            </div>
          </div>
          <ul className="list-tab" role="tablist">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li 
                  key={key}
                  className={`list-tab-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectList(list.id)}
                  // liタグを無視すると明言
                  role='presentation'
                >
                  <button type="button" role="tab">{list.title}</button>
                  
                </li>
              )
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select onChange={handleIsDoneDisplayChange} className="display-select">
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks tasks={tasks} selectListId={selectListId} isDoneDisplay={isDoneDisplay} />
          </div>
        </div>
      </main>
    </div>
  )
}

// 表示するタスク
function Tasks(props) {
  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>

  if(isDoneDisplay == "done"){
    return (
      <ul>
        {tasks.filter((task) => task.done === true)
        .map((task, key) =>  (
          <li key={key} className="task-item">
            <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
              {task.title}<br />
              {task.done ? "完了" : "未完了"}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul>
      {tasks.filter((task) => task.done === false)
      .map((task, key) => {
        // 期限日時をjstへ変換
        const jstLimit = new Date(task.limit);
        // 時間を文字列yyyy-MM-ddThh:mmにする
        const yyyy = jstLimit.getFullYear();
        // getMonthは1月は0だから
        const MM = jstLimit.getMonth() + 1;
        const dd = jstLimit.getDate();
        const hh = jstLimit.getHours();
        const mm = jstLimit.getMinutes();
        // 値が1桁なら0で補う
        const toDbDig = (i) => {
          if (i < 10){
            i = `0${  i}`;
          }
          return i;
        }
        const strLimit = `${yyyy  }-${  toDbDig(MM)  }-${  toDbDig(dd)  } ${  toDbDig(hh)  }:${  toDbDig(mm)}`;
        const regDate = new Date(task.limit);
        const today = new Date();
        const isExceed = regDate < today
        console.log(isExceed);
        const diff = isExceed ? today - regDate: regDate - today ;
        const diffDate = Math.floor(diff / (1000 * 60 * 60 * 24));
        const diffHour = Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
        const diffMin = Math.floor(diff % (1000 * 60 * 60 * 24) % (1000 * 60 * 60) / (1000 * 60));

        return(
        <li key={key} className="task-item">
          <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
            {task.title}<br />
            期限日時：{strLimit}<br />
            {isExceed ?　"超過時間": "残り日時"}:{diffDate}日 {diffHour}時間 {diffMin}分<br />
            {task.done ? "完了" : "未完了"}
          </Link>
        </li>
      )})}
    </ul>
  )
}