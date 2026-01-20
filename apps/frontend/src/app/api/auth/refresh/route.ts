import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: 'No refresh token found.' },
      { status: 401 }
    );
  }

  const AuthUrl = process.env.NEXT_PUBLIC_API_URL;
  const refreshUrl = `${AuthUrl}/auth/refresh-token?refresh_token=${refreshToken}`;

  try {
    const response = await fetch(refreshUrl, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Invalid refresh token');
    }

    const result = await response.json();

    // Adjust based on your backend response structure
    const responseData = {
      success: true,
      newAccessToken: result.data?.token || result.token,
      newRefreshToken: result.data?.refresh_token || refreshToken,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    const response = NextResponse.json(
      { success: false, error: 'Failed to refresh token.' },
      { status: 401 }
    );

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;
  }
}
