# fortify/github-action/package@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action-package.md -->

This action packages application source code using [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2320/SC_SAST_Help_23.2.0/index.htm#A_Clients.htm). The output package is saved as `package.zip`.

### Action environment variable inputs


<!-- START-INCLUDE:env-package.md -->

**`EXTRA_PACKAGE_OPTS`** - OPTIONAL   
By default, this action runs `scancentral package -o package.zip` to package application source code. Based on the  automated build tool detection feature provided by ScanCentral Client, this default `scancentral` command is often sufficient. Depending on your build setup, you may however need to configure the `EXTRA_PACKAGE_OPTS` environment variable to specify additional packaging options. 

As an example, if the build file that you want to use for packaging doesn't adhere  to common naming conventions, you can configure the `-bf <custom build file>` option using the `EXTRA_PACKAGE_OPTS` environment variable. See [Command-line options for the package command]({{var:sc-client-doc-base-url#CLI.htm#Package}}) for more information on available options.

<!-- END-INCLUDE:env-package.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on FoD.

```yaml
    steps:  
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Package source code
        uses: fortify/github-action/package@v1
        env:
          # EXTRA_PACKAGE_OPTS: -bf custom-pom.xml
```

<!-- END-INCLUDE:action-package.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
