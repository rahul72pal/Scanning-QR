''

import QRScanner from "./components/QRScanner";

export default function Home() {
  return (
    <div className="flex items-center justify-center sm:w-[100vw] w-[100vw] flex-col">
      <div className="w-[100%] sm:w-[100vw]">
        <QRScanner/>
      </div>
    </div>
  );
}
