-- Seed Data for AI-Powered Helpdesk System

-- 1. Support Teams
INSERT INTO support_teams (name, slug, description, lead_agent) VALUES
('Hardware Support', 'hardware', 'Endpoint devices, displays, power, and physical peripherals', 'Agent Jordan'),
('Software Support', 'software', 'Enterprise software, email, productivity suites, and licensing', 'Agent Taylor'),
('Network Support', 'network', 'VPN tunnels, Wi-Fi connectivity, DNS, firewalls, and routers', 'Agent Taylor'),
('IAM Support', 'iam', 'Identity & access management, SSO, MFA, and account privileges', 'Admin Morgan'),
('General IT Support', 'general', 'General triage and multi-disciplinary incident coordination', 'Agent Jordan')
ON CONFLICT DO NOTHING;

-- 2. SLA Policies
INSERT INTO sla_policies (priority, response_time_hours, resolution_time_hours) VALUES
('Critical', 1.0, 4.0),
('High', 2.0, 8.0),
('Medium', 4.0, 24.0),
('Low', 8.0, 48.0)
ON CONFLICT DO NOTHING;

-- 3. Routing Rules
INSERT INTO routing_rules (category, priority, team, agent_name, condition) VALUES
('Network', 'Critical', 'Network Support', 'Agent Taylor', 'Category=Network AND Priority=Critical'),
('Network', 'High', 'Network Support', 'Agent Taylor', 'Category=Network AND Priority=High'),
('Hardware', 'Critical', 'Hardware Support', 'Agent Jordan', 'Category=Hardware AND Priority=Critical'),
('Access Management', 'Critical', 'IAM Support', 'Admin Morgan', 'Category=Access Management AND Priority=Critical'),
('Software', 'High', 'Software Support', 'Agent Taylor', 'Category=Software AND Priority=High')
ON CONFLICT DO NOTHING;

-- 4. Knowledge Articles
INSERT INTO knowledge_articles (title, category, keywords, problem, solution, related_tickets) VALUES
('VPN Connection Troubleshooting', 'Network', 'vpn, remote access, connection, authentication, network, tunnel', 'Remote staff cannot establish or maintain active corporate VPN tunnels.', '1. Verify user Active Directory credentials.\n2. Restart Cisco AnyConnect / OpenVPN client service.\n3. Verify port 443 / UDP 1194 outbound traffic is not blocked by ISP.\n4. Check Okta Verify MFA prompt status.\n5. Flush local DNS cache using ipconfig /flushdns.', 'VPN not connecting, VPN drops continuously'),
('Password Reset & Account Unlock Procedure', 'Access Management', 'password reset, account lock, authentication, login, credentials, mfa', 'User cannot log in or Active Directory account has been locked after 3 failed password attempts.', '1. Authenticate user identity via secondary manager verification.\n2. Open Active Directory Users and Computers, locate user CN, unlock account.\n3. Issue temporary complex one-time password.\n4. Ensure user changes password on next logon.\n5. Verify MFA token is synchronized.', 'Employee account locked, Forgot domain password'),
('Laptop Power & Motherboard Diagnostics', 'Hardware', 'laptop, power, battery, hardware failure, motherboard, charger, boot', 'Laptop fails to start, LED power indicator is unlit, or device shuts down unexpectedly.', '1. Disconnect docking station and all USB peripherals.\n2. Test with a known good OEM power adapter (65W/100W).\n3. Perform hard EC reset by holding power button for 30 seconds.\n4. If amber charge LED blinks, allow 15 minutes of trickle charging before power on.\n5. If unresponsive, schedule hardware warranty dispatch.', 'Laptop not turning on, Battery swollen'),
('Enterprise Software Installation & Permission Errors', 'Software', 'install, app, software, package, dependency, admin rights, uac', 'Application setup wizard fails with Access Denied or error 1603.', '1. Check if user workstation is enrolled in Microsoft Intune.\n2. Deploy software package via Company Portal rather than direct installer.\n3. If standalone setup is required, elevate via LAPS admin privileges.\n4. Temporarily verify Windows Defender Antivirus exclusions for installation directory.\n5. Verify .NET Framework / VC++ runtime prerequisites.', 'Unable to install software, Installer crashing'),
('Network Connectivity & Gateway Recovery', 'Network', 'network, internet, connectivity, dns, router, switch, gateway, ip', 'Workstations report No Internet Access on Ethernet or Wi-Fi.', '1. Check physical patch cable and RJ-45 link lights.\n2. Run ipconfig /renew to verify DHCP server lease assignment.\n3. Ping default gateway IP to verify local switch port VLAN status.\n4. Test DNS resolution with nslookup google.com.\n5. If floor-wide, inspect switch stack uplink status in NetOps dashboard.', 'Network outage, No internet connection')
ON CONFLICT DO NOTHING;
