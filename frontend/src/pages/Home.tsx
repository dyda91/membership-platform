import ApiStatus from "../components/ApiStatus"

export default function Home() {
  return (
    <div>
      <h2 className="text-5xl font-bold text-black">
        Dashboard
      </h2>

      <p className="mt-4 text-xl text-gray-700">
        Welcome to the platform.
      </p>

      <div className="mt-6">
        <ApiStatus />
      </div>
    </div>
  )
}
