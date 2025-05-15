import { google } from 'googleapis';

export class GoogleCloudSetup {
  static async createProject(accessToken: string, projectName: string): Promise<string> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const cloudresourcemanager = google.cloudresourcemanager('v1');
    const projectId = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    const response = await cloudresourcemanager.projects.create({
      auth,
      requestBody: {
        projectId,
        name: projectName,
      },
    });

    // Wait for the operation to complete
    const operation = response.data;
    if (!operation.done) {
      throw new Error('Project creation operation not completed');
    }

    return projectId;
  }

  static async enableAPIs(projectId: string, accessToken: string): Promise<void> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const serviceusage = google.serviceusage('v1');
    const requiredAPIs = [
      'drive.googleapis.com',
      'aiplatform.googleapis.com',
      'cloudresourcemanager.googleapis.com',
    ];

    for (const apiName of requiredAPIs) {
      await serviceusage.services.enable({
        auth,
        name: `projects/${projectId}/services/${apiName}`,
      });
    }
  }

  static async createOAuthCredentials(projectId: string, accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const iam = google.iam('v1');
    const response = await iam.projects.serviceAccounts.create({
      auth,
      name: `projects/${projectId}`,
      requestBody: {
        accountId: 'novelist-service-account',
        serviceAccount: {
          displayName: 'Novelist Service Account',
        },
      },
    });

    return response.data;
  }

  static async validateSetup(projectId: string, accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const serviceusage = google.serviceusage('v1');
    const response = await serviceusage.services.list({
      auth,
      parent: `projects/${projectId}`,
      filter: 'state:ENABLED',
    });

    const enabledAPIs = response.data.services?.map((service) => service.name) || [];
    const requiredAPIs = [
      'drive.googleapis.com',
      'aiplatform.googleapis.com',
      'cloudresourcemanager.googleapis.com',
    ];

    const hasRequiredAPIs = requiredAPIs.every((api) =>
      enabledAPIs.some((enabled) => enabled?.includes(api))
    );

    return {
      hasRequiredAPIs,
      enabledAPIs,
    };
  }
} 