const {Link: RouterLink, NavLink: RouterNavLink} = require('react-router-dom')
const {PraxComponent} = require('prax')

export const Link = RouterLink

export class NavLink extends PraxComponent {
  subrender ({deref}) {
    const {env, props: {to, ...props}} = this
    const {location} = deref(env.deref().nav)

    return (
      <RouterNavLink
        to={/^#/.test(to) ? (location.pathname + to) : to}
        location={location}
        {...props} />
    )
  }
}
