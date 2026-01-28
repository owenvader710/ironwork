import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // 1) โหลดข้อมูลจาก Supabase
  const fetchProjects = async () => {
    setLoading(true);
    setErrMsg("");
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrMsg(error.message);
      setProjects([]);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2) เพิ่ม Demo Project
  const addDemo = async () => {
    setErrMsg("");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const orderDate = `${yyyy}-${mm}-${dd}`;

    const deadlineDate = new Date(today.getTime() + 86400000);
    const yyyy2 = deadlineDate.getFullYear();
    const mm2 = String(deadlineDate.getMonth() + 1).padStart(2, "0");
    const dd2 = String(deadlineDate.getDate()).padStart(2, "0");
    const deadline = `${yyyy2}-${mm2}-${dd2}`;

    const payload = {
      project_id: `PJ-${yyyy}-${Math.floor(Math.random() * 900 + 100)}`,
      name: "Demo from App",
      type: "Graphic", // ต้องตรงกับ CHECK (Graphic/Video)
      assigned_to: "เดย์",
      order_date: orderDate,
      deadline,
      status: "To Do",
      sub_status: null,
      progress: 0,
      video_quality: null,
      pending_approval: null,
      blocked_reason_preset: null,
      blocked_at: null,
      updates: [],
    };

    const { error } = await supabase.from("projects").insert(payload);

    if (error) {
      setErrMsg(error.message);
      return;
    }

    await fetchProjects();
  };

  // 3) ลบแถว
  const removeProject = async (id) => {
    setErrMsg("");
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      setErrMsg(error.message);
      return;
    }
    await fetchProjects();
  };

  // 4) แปลงเป็นแถวตาราง
  const rows = useMemo(() => projects || [], [projects]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>IRONWORK — Projects</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <button onClick={fetchProjects} style={btnStyle}>Reload</button>
        <button onClick={addDemo} style={btnStyle}>+ Add Demo Project</button>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#555" }}>
          {loading ? "Loading..." : `Total: ${rows.length}`}
        </div>
      </div>

      {errMsg && (
        <div style={{ background: "#ffecec", color: "#b00020", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          Error: {errMsg}
        </div>
      )}

      <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <Th>ID</Th>
              <Th>Project Code</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Assigned</Th>
              <Th>Status</Th>
              <Th>Progress</Th>
              <Th>Deadline</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 14 }}>Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 14 }}>No projects</td></tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                  <Td>{p.id}</Td>
                  <Td>{p.project_id}</Td>
                  <Td>{p.name}</Td>
                  <Td>{p.type}</Td>
                  <Td>{p.assigned_to}</Td>
                  <Td>{p.status}</Td>
                  <Td>{p.progress}%</Td>
                  <Td>{p.deadline}</Td>
                  <Td>
                    <button onClick={() => removeProject(p.id)} style={dangerBtnStyle}>
                      Delete
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
        * ตอนนี้เป็นหน้า Admin/Test: โชว์ตาราง + เพิ่ม/ลบได้ เพื่อยืนยันว่า “อ่าน/เขียน DB ได้จริง”
      </p>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "#333" }}>{children}</th>;
}
function Td({ children }) {
  return <td style={{ padding: 12, fontSize: 13, color: "#111" }}>{children}</td>;
}

const btnStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
};

const dangerBtnStyle = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ffd0d0",
  background: "#fff5f5",
  color: "#b00020",
  cursor: "pointer",
};
