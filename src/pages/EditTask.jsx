import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { url } from "../const";
import { Header } from "../components/Header";
import "./editTask.scss"

export function EditTask() {
  const nav = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [today, setToday] = useState("");
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  // 期限日時の入力は文字列で受け取る(inputはdate型では表示できないので)
  const handleLimitChange = (e) => setLimit(e.target.value);
  const handleIsDoneChange = (e) => setIsDone(e.target.value === "done");
  const onUpdateTask = () => {
    // postする前に期限日時文字列をdate型に直す
    // postされる期限日時はdate型。保存の時は自動的にUTCになる
    const postLimit = new Date(limit)
    console.log(postLimit);
    const data = {
      title,
      detail,
      limit: postLimit,
      done: isDone
    }
    console.log(data);
    axios.put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      console.log(res.data);
      nav("/");
    })
    .catch((err) => {
      setErrorMessage(`更新に失敗しました。${err}`);
    })
  }

  const onDeleteTask = () => {
    axios.delete(`${url}/lists/${listId}/tasks/${taskId}`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then(() => {
      nav("/");
    })
    .catch((err) => {
      setErrorMessage(`削除に失敗しました。${err}`);
    })
  }

  useEffect(() => {
    axios.get(`${url}/lists/${listId}/tasks/${taskId}`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      const task = res.data
      setTitle(task.title)
      setDetail(task.detail)
      // setLimit(task.limit)
      setIsDone(task.done)

      // task.limitをUTCからJSTのdate型へ変換
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
      const strLimit = `${yyyy  }-${  toDbDig(MM)  }-${  toDbDig(dd)  }T${  toDbDig(hh)  }:${  toDbDig(mm)}`;
      setLimit(strLimit);

      // 本日より前の日時は選べないようにする
      const getToday = new Date();
      // 時間を文字列yyyy-MM-ddThh:mmにする
      const toyyyy = getToday.getFullYear();
      // getMonthは1月は0だから
      const toMM = getToday.getMonth() + 1;
      const todd = getToday.getDate();
      const tohh = getToday.getHours();
      const tomm = getToday.getMinutes();
      const strToday = `${toyyyy  }-${  toDbDig(toMM)  }-${  toDbDig(todd)  }T${  toDbDig(tohh)  }:${  toDbDig(tomm)}`;
      setToday(strToday);
    })
    .catch((err) => {
      setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
    })
  }, [])

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label><br />
          <input type="text" onChange={handleTitleChange} className="edit-task-title" value={title} /><br />
          <label>詳細</label><br />
          <textarea type="text" onChange={handleDetailChange} className="edit-task-detail" value={detail} /><br />
          <label>期限日</label><br />
          <input type="datetime-local" onChange={handleLimitChange} className="edit-task-limit" value={limit} min={today}/><br />
          <div>
            <input type="radio" id="todo" name="status" value="todo" onChange={handleIsDoneChange} checked={isDone === false ? "checked" : ""} />未完了
            <input type="radio" id="done" name="status" value="done" onChange={handleIsDoneChange} checked={isDone === true ? "checked" : ""} />完了
          </div>
          <div className="button">
            <button type="button" className="delete-task-button" onClick={onDeleteTask}>削除</button>
            <button type="button" className="edit-task-button" onClick={onUpdateTask}>更新</button>
          </div>
        </form>
      </main>
    </div>
  )
}