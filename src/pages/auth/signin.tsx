import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { signIn, getProviders } from 'next-auth/react'
import { authOptions } from '../api/auth/[...nextauth]'
import Head from 'next/head'
import { LogIn } from 'lucide-react'

interface Provider {
  id: string
  name: string
}

interface SignInProps {
  providers: Record<string, Provider>
}

export default function SignIn({ providers }: SignInProps) {
  return (
    <>
      <Head>
        <title>로그인 - ViewTrap Clone</title>
        <meta name="description" content="ViewTrap Clone에 로그인하세요" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ViewTrap Clone
              </h1>
              <p className="text-gray-600">
                크리에이터를 위한 트렌드 리서치 플랫폼
              </p>
            </div>

            <div className="space-y-4">
              {Object.values(providers).map((provider) => (
                <div key={provider.name}>
                  <button
                    onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {provider.name === 'Google' && (
                      <LogIn className="w-5 h-5 mr-3 text-red-500" />
                    )}
                    {provider.name}로 계속하기
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                로그인하면{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  이용약관
                </a>
                과{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  개인정보처리방침
                </a>
                에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요? 위의 버튼으로 간편하게 회원가입할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    }
  }

  const providers = await getProviders()

  return {
    props: {
      providers: providers ?? {},
    },
  }
}