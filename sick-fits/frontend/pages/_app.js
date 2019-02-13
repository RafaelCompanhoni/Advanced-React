import App, { Container } from 'next/app';
import Page from '../components/Page';
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';

class MyApp extends App {
  // Next.js lifecycle method -- this makes every page to execute any GraphQL query contained in it (e.g. fetch list of items)
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    if(Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    // this exposes the query to the user
    pageProps.query = ctx.query;
    return { pageProps };
  }

  render() {
    const { Component, apollo, pageProps } = this.props;

    // wrap all pages of the app with the ApolloProvider so we can use the Apollo Client
    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    );
  }
}

// withData injects the actual Apollo Client to the React app (as a prop) which is used by the ApolloProvider (client prop, see above)
export default withData(MyApp);
