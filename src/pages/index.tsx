import Head from 'next/head'
import { TrendingUp, Youtube, Brain, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Head>
        <title>ViewTrap Clone - 크리에이터를 위한 트렌드 리서치</title>
        <meta name="description" content="YouTube 크리에이터를 위한 트렌드 분석 및 콘텐츠 최적화 플랫폼" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              크리에이터를 위한 트렌드 리서치의 모든 것!
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI 기반 YouTube 트렌드 분석으로 성공하는 콘텐츠를 만들어보세요
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">트렌드 분석</h3>
              <p className="text-gray-600">실시간 YouTube 트렌드를 분석하여 인기 콘텐츠를 파악하세요</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Youtube className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">YouTube 분석</h3>
              <p className="text-gray-600">채널별 성과와 경쟁자 분석을 통해 전략을 수립하세요</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 추천</h3>
              <p className="text-gray-600">AI가 최적의 제목과 썸네일을 추천해드립니다</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">성과 분석</h3>
              <p className="text-gray-600">상세한 분석 리포트로 콘텐츠 성과를 확인하세요</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
              무료로 시작하기
            </button>
            <p className="text-gray-500 mt-4">
              회원가입 없이 바로 시작할 수 있습니다
            </p>
          </div>
        </div>
      </main>
    </>
  )
}