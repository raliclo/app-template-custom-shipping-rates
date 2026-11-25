import { type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { wixAppClient } from '@/app/utils/wix-sdk.app';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  console.log('App install requested.');
  const token = searchParams.get('token');
  if (!token) {
    return new Response(`Cannot authorize without token query param.`, {
      status: 403,
    });
  }

  // The state object allows you to transfer information throughout the installation flow.
  let stateObject: Record<string, unknown> = {};
  const rawState = searchParams.get('state');
  if (rawState) {
    try {
      stateObject = JSON.parse(rawState);
    } catch {
      return new Response('Invalid state query param.', { status: 400 });
    }
  }

  // When deploying to Netlify, `process.env.URL` is used, since `request.nextUrl.href` may contain an invalid port number in Next.js 14.
  // For more information, see this [Netlify support post](https://answers.netlify.com/t/error-x-forwarded-host-header-with-value-example-netlify-app-80-does-not-match-origin-header-with-value-example-netlify-app-from-a-forwarded-server-actions-request/106736).
  const baseUrl = process.env.URL || request.nextUrl.href.split('/api/oauth/')[0];

  return redirect(
    wixAppClient.auth.getInstallUrl({
      token,
      state: JSON.stringify(stateObject),
      redirectUrl: `${baseUrl}/api/oauth/v1/signup`,
    }),
  );
}
