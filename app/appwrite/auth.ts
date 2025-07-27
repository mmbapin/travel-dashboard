import { ID, OAuthProvider, Query } from "appwrite";
import { redirect } from "react-router";
import { account, appwriteConfig, database } from "~/appwrite/client";

export const loginWithGoogle = async () => {
  try {
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/`,
      `${window.location.origin}/404`
    )
  } catch (error) {
    console.log("loginWithGoogle :", error);
  }
}


export const getUser = async () => {
  try {
    const user = await account.get();

    if (!user) {
      return redirect('/sign-in');
    }

    const {documents} = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.equal('accountId', user.$id),
        Query.select(['name', 'email', 'imageUrl', 'joinedAt', 'accountId'])
      ]
    )
    return documents.length > 0 ? documents[0] : redirect("/sign-in");
  } catch (error) {
    console.log(error);
  }
} 


export const logoutUser = async () => {
  try {
    await account.deleteSession('current');
    return true
  } catch (error) {
    console.log("Logout User Error :", error);
    return false
  }
}




export const getGooglePicture = async () => {
  try {
    const session = await account.getSession('current');

    //Get OAuth Token
    const oAuthToken = session.providerAccessToken

    if(!oAuthToken) {
      console.log("No OAuth Token found");
      return null;
    }

    //Make  a request to Google API to get user's profile picture
    const response = await fetch(`https://people.googleapis.com/v1/people/me?personFields=photos`, {
      headers: {
        'Authorization': `Bearer ${oAuthToken}`
      }
    });
    
    if(!response.ok){
      console.log("Failed to get Google profile picture");
      return null;
    }

    const data = await response.json();

    //Extract profile photo url from the response
    const photoUrl = data.photos && data.photos.length > 0 ? data.photos[0].url : null;
    return photoUrl;

  } catch (error) {
    console.log("Google Picture Error :",error);
    return null;
  }
}


export const storeUserData = async () => {
  try {
    const user = await account.get();
    if (!user) throw new Error("User not found");

    // Check if user already exists in the database
    const { documents } = await database.listDocuments( 
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", user.$id)]
    );


    if (documents.length > 0) return documents[0]; // User already exists

    //Get Profile Picture from Google API if available
    const imageUrl = await getGooglePicture();


    // const { providerAccessToken } = (await account.getSession("current")) || {};
    // const profilePicture = providerAccessToken
    //   ? await getGooglePicture(providerAccessToken)
    //   : null;

    const createdUser = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: user.$id,
        email: user.email,
        name: user.name,
        imageUrl: imageUrl || '',
        joinedAt: new Date().toISOString(),
      }
    );

    return createdUser
  } catch (error) {
    console.error("Error storing user data:", error);
  }
}


export const getExistingUser = async (id: string) => {
  try {
    const { documents, total } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", id)]
    );
    return total > 0 ? documents[0] : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}