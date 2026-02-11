import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 border border-gray-100">
      <h3 className="text-xl font-black">ไม่พบหน้านี้</h3>
      <p className="text-gray-500 text-sm mt-2">ลิงก์อาจผิด หรือหน้ายังไม่ได้สร้าง</p>
      <Link to="/dashboard" className="inline-block mt-4 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold">
        กลับไป dashboard
      </Link>
    </div>
  );
}
