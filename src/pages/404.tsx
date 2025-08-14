import Link from 'next/link'
import Head from 'next/head'
import { Home, Search } from 'lucide-react'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>페이지를 찾을 수 없습니다 - ViewTrap Clone</title>
        <meta name="description" content="요청하신 페이지를 찾을 수 없습니다." />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-blue-600">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mt-4">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 mt-2">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Link>
            
            <Link
              href="/search"
              className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              콘텐츠 검색하기
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}