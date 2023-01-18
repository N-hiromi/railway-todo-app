import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { url } from "../const";
import { Header } from "../components/Header";
import "./newTask.scss"
import { useNavigate } from "react-router-dom";

export function NewTask() {
  const [selectListId, setSelectListId] = useState();
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [limit, setLimit] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const [today, setToday] = useState("");
  const nav = useNavigate();
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleLimitChange = (e) => setLimit(new Date(e.target.value));
  const handleSelectList = (id) => setSelectListId(id);
  const onCreateTask = () => {
    const data = {
      title,
      detail,
      limit,
      done: false,
    };
    console.log(data);

    axios.post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`
        }
    })
    .then((res) => {
      console.log(res.data);
      nav("/");
    })
    .catch((err) => {
      setErrorMessage(`タスクの作成に失敗しました。${err}`);
    })
  }

  useEffect(() => {
    axios.get(`${url}/lists`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      setLists(res.data)
      setSelectListId(res.data[0]?.id)

      // 本日より前の日時は選べないようにする
      const getToday = new Date();
      // 時間を文字列yyyy-MM-ddThh:mmにする
      const toyyyy = getToday.getFullYear();
      // getMonthは1月は0だから
      const toMM = getToday.getMonth() + 1;
      const todd = getToday.getDate();
      const tohh = getToday.getHours();
      const tomm = getToday.getMinutes();

      // 値が1桁なら0で補う
      const toDbDig = (i) => {
        if (i < 10){
          i = `0${  i}`;
        }
        return i;
      }
      
      const strToday = `${toyyyy  }-${  toDbDig(toMM)  }-${  toDbDig(todd)  }T${  toDbDig(tohh)  }:${  toDbDig(tomm)}`;
      setToday(strToday);
    })
    .catch((err) => {
      setErrorMessage(`リストの取得に失敗しました。${err}`);
    })
  }, [])

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label>リスト</label><br />
          <select onChange={(e) => handleSelectList(e.target.value)} className="new-task-select-list">
            {lists.map((list, key) => (
              <option key={key} className="list-item" value={list.id}>{list.title}</option>
            ))}
          </select><br />
          <label>タイトル</label><br />
          <input type="text" onChange={handleTitleChange} className="new-task-title" /><br />
          <label>詳細</label><br />
          <textarea type="text" onChange={handleDetailChange} className="new-task-detail" /><br />
          <label>期限</label><br />
          <input type="datetime-local" onChange={handleLimitChange} className="new-task-limit" min={today}/><br />
          <div className="button">
            <button type="button" className="new-task-button" onClick={onCreateTask}>作成</button>
          </div>
        </form>
      </main>
    </div>
  )
}