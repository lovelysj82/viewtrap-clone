import { useState } from 'react'
import Head from 'next/head'

export default function TestAPI() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/youtube/search?query=뉴진스&maxResults=3')
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult('Error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const testTrending = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/youtube/trending?region=KR&maxResults=3')
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult('Error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>API 테스트 - ViewTrap Clone</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">YouTube API 키 순환 테스트</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '검색 API 테스트'}
          </button>
          
          <button
            onClick={testTrending}
            disabled={loading}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '트렌딩 API 테스트'}
          </button>
        </div>

        {result && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">결과:</h2>
            <pre className="text-sm overflow-auto max-h-96">{result}</pre>
          </div>
        )}
      </div>
    </>
  )
}