''

import QRScanner from "./components/QRScanner";

export default function Home() {
  return (
    <div className="flex items-center justify-center w-[100vw] flex-col">
      <div className="w-[100%]">
        <QRScanner/>
      </div>
    </div>
  );
}
